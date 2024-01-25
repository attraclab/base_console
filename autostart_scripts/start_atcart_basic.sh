#!/bin/bash

#sleep 45

project=web_dev/base_console

export DISPLAY=:0.0
export LOGFILE=/home/$USER/$project/autostart_scripts/atcart_basic.log

export ROS_DOMAIN_ID=1
source /opt/ros/galactic/setup.bash
source /home/$USER/dev_ws/install/local_setup.bash

while true
do
		echo >>$LOGFILE
		echo "----------------------------------------------" >> $LOGFILE
		date >> $LOGFILE

		echo "Starting atcart_basic" >> $LOGFILE
		
		ros2 run jmoab_ros2 atcart_basic >> $LOGFILE

		echo "program crashed" >> $LOGFILE

		date >> $LOGFILE
		sleep 1

done
