#!/bin/bash

#sleep 30

project=web_dev/base_console

export DISPLAY=:0.0
export LOGFILE=/home/$USER/$project/autostart_scripts/zenoh_bridge.log

export ROS_DOMAIN_ID=1
source /opt/ros/galactic/setup.bash
source /home/$USER/dev_ws/install/local_setup.bash

cd /home/$USER/$project/zenoh_bridge

while true
do
		echo >>$LOGFILE
		echo "----------------------------------------------" >> $LOGFILE
		date >> $LOGFILE

		echo "Starting zenoh_bridge" >> $LOGFILE
		
		./zenoh-bridge-dds-aarch64  -c bridge-atcart-config.json5 >> $LOGFILE

		echo "program crashed" >> $LOGFILE
		date >> $LOGFILE
		
		sleep 1

done
