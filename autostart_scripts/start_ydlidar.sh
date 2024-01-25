#!/bin/bash

#sleep 40

project=web_dev/base_console

export DISPLAY=:0.0
export LOGFILE=/home/$USER/$project/autostart_scripts/ydlidar.log

export ROS_DOMAIN_ID=1
source /opt/ros/galactic/setup.bash
source /home/$USER/dev_ws/install/local_setup.bash

while true
do
		echo >>$LOGFILE
		echo "----------------------------------------------" >> $LOGFILE
		date >> $LOGFILE

		echo "Starting ydlidar_launch.py" >> $LOGFILE
		
		ros2 launch ydlidar_ros2_driver  ydlidar_launch.py >> $LOGFILE

		echo "program crashed" >> $LOGFILE

		date >> $LOGFILE
		sleep 1

done
