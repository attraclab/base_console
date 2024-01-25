#!/bin/bash

#sleep 50

project=web_dev/base_console

export DISPLAY=:0.0
export LOGFILE=/home/$USER/$project/autostart_scripts/atcart_handler.log

export ROS_DOMAIN_ID=1
source /opt/ros/galactic/setup.bash
source /home/$USER/dev_ws/install/local_setup.bash

cd /home/$USER/$project/python

while true
do
		echo >>$LOGFILE
		echo "----------------------------------------------" >> $LOGFILE
		date >> $LOGFILE

		echo "Starting atcart_basic_handler" >> $LOGFILE
		
		python3 -u atcart_basic_handler.py >> $LOGFILE

		echo "program crashed" >> $LOGFILE

		date >> $LOGFILE
		sleep 1

done
