# Base Console

This is a sample web console to control robot platform such as ATCart, ATCrawler, ATBot, etc.

## TODO

1. You will need to setup zenohd or zenoh router on the cloud. And copy the public IP address of VM
2. on [js/ros2_pubsub.js](./js/ros2_pubsub.js), change the IP of `zenoh_rest_url` and `zenoh_cam_url` to your VM IP.
3. on [zenoh_bridge/bridge-atcart-config.json5](./zenoh_bridge/bridge-atcart-config.json5) change the endpoints IP as your VM IP.

