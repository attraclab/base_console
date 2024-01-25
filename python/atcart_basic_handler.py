import rclpy
from rclpy.node import Node
from std_msgs.msg import Int8MultiArray, Bool, Int8
from sensor_msgs.msg import LaserScan
import numpy as np

class ATCartBasicHandler(Node):

	def __init__(self):
		super().__init__('atcart_basic_handler')

		self.left_wf_min_scan_ang = 1.0
		self.left_wf_max_scan_ang = 90.0
		self.right_wf_min_scan_ang = -90.0
		self.right_wf_max_scan_ang = -1.0

		self.left_wf_first_idx = self.lidarAng_to_lidarIdx(self.left_wf_min_scan_ang) 
		self.left_wf_last_idx = self.lidarAng_to_lidarIdx(self.left_wf_max_scan_ang)

		self.right_wf_first_idx = self.lidarAng_to_lidarIdx(self.right_wf_min_scan_ang) 
		self.right_wf_last_idx = self.lidarAng_to_lidarIdx(self.right_wf_max_scan_ang)

		self.left_wf_min_dist = 10.0
		self.prev_left_wf_min_dist = self.left_wf_min_dist
		self.no_left_dist = True
		self.right_wf_min_dist = 10.0
		self.prev_right_wf_min_dist = self.right_wf_min_dist
		self.no_right_dist = True

		## Pub/Sub ##
		scan_qos = rclpy.qos.QoSProfile(
										reliability=rclpy.qos.ReliabilityPolicy.BEST_EFFORT, \
										history=rclpy.qos.HistoryPolicy.KEEP_LAST, \
										depth=1)
		self.scan_sub = self.create_subscription(LaserScan, '/scan', self.scan_callback, scan_qos)
		self.atcart_light_sub = self.create_subscription(Bool, '/atcart/light', self.atcart_light_callback, 10)

		self.atcart_scan_pub = self.create_publisher(LaserScan, '/atcart/scan', 10)
		self.jmoab_relays_pub = self.create_publisher(Int8MultiArray, '/jmoab/relays', 10)

		self.warning_pub = self.create_publisher(Int8, '/atcart/warning', 10)
		self.warning_msg = Int8()
		print("start atcart_basic_handler")
		## Loop ##
		self.timer = self.create_timer(0.1, self.timer_callback)

	####################
	### ROS callback ###
	####################
	def scan_callback(self, msg):

		atcart_scan = LaserScan()
		atcart_scan.header = msg.header
		atcart_scan.time_increment = msg.time_increment
		atcart_scan.angle_increment = msg.angle_increment
		atcart_scan.angle_min = msg.angle_min
		atcart_scan.angle_max = msg.angle_max
		atcart_scan.scan_time = msg.scan_time
		atcart_scan.range_min = msg.range_min
		atcart_scan.range_max = msg.range_max
		ranges_array = np.asarray(msg.ranges).tolist()
		atcart_scan.intensities = msg.intensities

		del ranges_array[1::2]
		del ranges_array[1::2]
		del ranges_array[1::2]
		# print(len(ranges_array))
		atcart_scan.ranges = ranges_array
		self.atcart_scan_pub.publish(atcart_scan)

		left_array_ranges = msg.ranges[self.left_wf_first_idx:self.left_wf_last_idx]
		right_array_ranges = msg.ranges[self.right_wf_first_idx:self.right_wf_last_idx]

		self.left_wf_min_dist, self.no_left_dist = self.remove_zero_from_array(left_array_ranges, self.prev_left_wf_min_dist)
		self.prev_left_wf_min_dist = self.left_wf_min_dist
		self.right_wf_min_dist, self.no_right_dist  = self.remove_zero_from_array(right_array_ranges, self.prev_right_wf_min_dist)
		self.prev_right_wf_min_dist = self.right_wf_min_dist

	def atcart_light_callback(self, msg):
		relays_msg = Int8MultiArray()
		if msg.data:
			relays_msg.data = [1,1]
		else:
			relays_msg.data = [0,0]
		self.jmoab_relays_pub.publish(relays_msg)

	######################
	### Math functions ###
	######################
	def lidarAng_to_lidarIdx(self, ang):
		return int(self.map_with_limit(ang, -180.0, 180.0, 0.0, 2019.0))

	def map_with_limit(self, val, in_min, in_max, out_min, out_max):

		# out = ((val - in_min) * ((out_max - out_min) / (in_max - in_min))) + out_min
		## in_min must be the minimum input 
		## in_max must be the maximum input

		## out_min is supposed to map with in_min value
		## out_max is sipposed to map with in_max value
		## out_min can be less/more than out_max, doesn't matter


		m = (out_max - out_min)/(in_max - in_min)
		out = m*(val - in_min) + out_min

		if out_min > out_max:
			if out > out_min:
				out = out_min
			elif out < out_max:
				out = out_max
			else:
				pass
		elif out_max > out_min:
			if out > out_max:
				out = out_max
			elif out < out_min:
				out = out_min
			else:
				pass
		else:
			pass

		# print(m, val, in_min, in_max, out_min, out_max)

		return out

	def remove_zero_from_array(self, range_list, prev_value):

		array = np.asarray(range_list)
		array = array[array !=0]

		if (len(array) == 0):
			min_value = prev_value
			no_value = True
		else:
			array = array[array !=0]
			min_value = np.min(array)
			no_value = False

		if np.isinf(min_value):
			# print("Got inf!")
			min_value = prev_value
			no_value = False

		return min_value, no_value

	############
	### Loop ###
	############
	def timer_callback(self):

		if self.no_left_dist and self.no_right_dist:
			self.warning_msg.data = -1
		else:
			if (self.left_wf_min_dist <= 0.5):
				self.warning_msg.data = 1
			elif (self.right_wf_min_dist <= 0.5):
				self.warning_msg.data = 2
			else:
				self.warning_msg.data = 0

		self.warning_pub.publish(self.warning_msg)


def main(args=None):
	rclpy.init(args=args)
	node = ATCartBasicHandler()
	rclpy.spin(node)
	node.destroy()
	rclpy.shutdown()

if __name__ == '__main__':
	main()       
