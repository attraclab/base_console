
from imutils.video import VideoStream
import imutils
import time
import cv2
import zenoh
import json

CAMERA_ID = '/dev/video0'
vs = VideoStream(src=CAMERA_ID).start()
# connect = ['tcp/192.168.8.100:7447']
connect = ['tcp/172.233.89.212:7447']
key = "atcart/cams/0"
quality = 95
delay = 0.01
jpeg_opts = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
conf = zenoh.Config()
conf.insert_json5(zenoh.config.CONNECT_KEY, json.dumps(connect))
z = zenoh.open(conf)
print("Start zcapture")
time.sleep(1.0)

while True:

    raw = vs.read()
    if raw is not None:
        frame = imutils.resize(raw, width=360)
        # print(type(frame))
        _, jpeg = cv2.imencode('.jpg', frame, jpeg_opts)

        z.put(key, jpeg.tobytes())

    time.sleep(delay)
