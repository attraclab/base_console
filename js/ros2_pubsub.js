var zenoh_rest_url = "http://192.168.8.123:8000/"
var zenoh_cam_url = "http://192.168.8.123:8080/"


var scope = "atcart"

const Http = new XMLHttpRequest();

/////////////////////
///// Publisher /////
/////////////////////
function publish(ros_msg, topic){
    var writer = new jscdr.CDRWriter();
    ros_msg.encode(writer)

    if (topic.startsWith("/") === false){
        topic = "/" + topic
    }
    var key_expr = scope + "/rt" + topic

    Http.open('PUT', zenoh_rest_url + key_expr, true);
    Http.setRequestHeader('Content-Type', 'application/octet-stream');
    Http.send(writer.buf.buffer);
}


///////////////
/// cmd_vel ///
///////////////
function pubTwist(linear, angular) {

    // Create a Twist message
    var twist = new Twist(
        new Vector3(linear, 0.0, 0.0),
        new Vector3(0.0, 0.0, angular));
    publish(twist, "/cmd_vel")
}

/////////////////////
/// cart_mode_cmd ///
/////////////////////
function pubCartMode(mode){
    var cart_mode_msg = new Int8(mode)
    publish(cart_mode_msg, "/jmoab/cart_mode_cmd")
}
function mode_press(mode){
    pubCartMode(mode)
    console.log("publish cart mode ", mode)
}

//////////////////////
/// Relays control ///
//////////////////////
function pubRelay(data){

    var msg = new Bool(data)
    publish(msg, "/atcart/light")
}


//////////////////////
///// Subscriber ////
/////////////////////

/////////////////
/// Laserscan ///
/////////////////

/// Canvas to draw scan ///
var canvas = document.querySelector(".map_canvas")
canvas.width = 400;
canvas.height = 400;
var center_x = canvas.width/2
var cetner_y = canvas.height/2
var ctx = canvas.getContext('2d');

var frame_width_meter = 10
var frame_height_meter = 10

function linear_map(val, in_min, in_max, out_min, out_max){
    let m = (out_max - out_min)/(in_max - in_min)
	let out = m*(val - in_min) + out_min
	return out
}

function draw_radar_line(){
    let start_r = canvas.width/frame_width_meter;
    for (var i=1; i<6; i++){
        ctx.beginPath();
        ctx.arc(center_x, cetner_y, start_r*i, 0.0, Math.PI*2, false)
        ctx.strokeStyle = "black"
        ctx.fillStyle = "black";
        ctx.font = "15px serif";
        ctx.fillText(`${i}`, canvas.width/2, canvas.height/2-(i*start_r)+12);
        ctx.stroke();
    }
}

var scan_source = null;
var last_plot_stamp = new Date().getTime()
var laser_scan_ranges;
var laser_scan_angles = [];

function subscribeToScan() {
    // close previous if exists
    if (scan_source != null) {
        console.log("CLOSE Scan EventSource");
        scan_source.close();
    }

    if (typeof (EventSource) !== "undefined") {

        var scan_res = "/rt/atcart/scan"

        console.log("Subscribe to EventSource: " + zenoh_rest_url + scope + scan_res);
        scan_source = new EventSource(zenoh_rest_url + scope + scan_res);
        scan_source.addEventListener("PUT", function (e) {
            let sample = JSON.parse(e.data);
            let reader = new jscdr.CDRReader(dcodeIO.ByteBuffer.fromBase64(sample.value));
            let scan = LaserScan.decode(reader);
            // console.log("scan", scan)

            laser_scan_ranges = scan.ranges;
            
            laser_scan_angles = []
            var angle = 0 //scan.angle_min
            let ang_inc = 6.283185/scan.ranges.length
            ctx.clearRect(0, 0 , canvas.width, canvas.height);
            draw_radar_line()
            for (var i=0; i<scan.ranges.length; i++){
                let x = Math.cos(angle - (Math.PI/2))*scan.ranges[i]
                let y = Math.sin(angle - (Math.PI/2))*scan.ranges[i]

                // let x = Math.cos(angle)*scan.ranges[i]
                // let y = Math.sin(angle)*scan.ranges[i]

                let px = linear_map(x, -frame_width_meter/2, frame_width_meter/2, 0, canvas.width)
                let py = linear_map(y, -frame_height_meter/2, frame_height_meter/2, canvas.height, 0)

                ctx.beginPath();
                ctx.arc(px, py, 2, 0.0, Math.PI*2, false)
                ctx.strokeStyle = "red"
                ctx.fillStyle = "red"
                ctx.fill()
                ctx.stroke();

                angle += ang_inc
            }

        }, false);


    } else {
        document.document.getElementById("Lidar").innerHTML = "Sorry, your browser does not support server-sent events...";
    }
}


//////////////
/// camera ///
//////////////
function setCameraSrc() {
    // If your robot has a camera and zcapture installed (from zenoh-demos/computer-vision/zcam/),
    // uncomment the camera <div> block on top of this file.
    // The zcapture must be started with "-k <scope>/cams/0", and the zenoh router must have the WebServer plugin running
    if (document.getElementById("camera_img") != null) {
        // Set "camera_img" element's src to the same URL host, but with port 8080 (WebServer plugin)
        // and with path: "demo/zcam?_method=SUB"
        console.log("video coming!!")
        img_url = zenoh_cam_url+ scope + "/cams/0?_method=SUB";
        document.getElementById("camera_img").src = img_url;
    } else {

    }
}
///////////////
/// Warning ///
///////////////
var warning_source = null;
var warning_logs_box = document.getElementById('warning_log_box')
var last_warning_log_stamp = new Date().getTime()
function subscribeToWarning(){

    if (warning_source != null) {
        console.log("CLOSE Warning EventSource");
        warning_source.close();
    }
    if (typeof (EventSource) !== "undefined") {

        var warning_topic = "/rt/atcart/warning"

        console.log("Subscribe to EventSource: " + zenoh_rest_url + scope + warning_topic);
        warning_source = new EventSource(zenoh_rest_url + scope + warning_topic);
        warning_source.addEventListener("PUT", function (e) {
            let sample = JSON.parse(e.data);
            let reader = new jscdr.CDRReader(dcodeIO.ByteBuffer.fromBase64(sample.value));
            let warning = Bool.decode(reader);

            if (warning.data == 0){
                warning_logs_box.value = "all clear"
                warning_logs_box.style.color = '#000000';
                warning_logs_box.style.fontWeight = 'normal'
                warning_logs_box.style.backgroundColor = "#FFFFFF"
            } else if (warning.data == 1){
                warning_logs_box.value = "Becareful Left Object!"
                warning_logs_box.style.color = '#FFFFFF';
                warning_logs_box.style.fontWeight = 'bold'
                warning_logs_box.style.backgroundColor = "#FF0000"
            } else if (warning.data == 2){
                warning_logs_box.value = "Becareful Right Object!"
                warning_logs_box.style.color = '#FFFFFF';
                warning_logs_box.style.fontWeight = 'bold'
                warning_logs_box.style.backgroundColor = "#FF0000"
            } else if (warning.data == -1){
                warning_logs_box.value = "No LaserScan Data"
                warning_logs_box.style.color = '#000000';
                warning_logs_box.style.fontWeight = 'normal'
                warning_logs_box.style.backgroundColor = "#d1d1d1"
            } 
            
            
        }, false);
    }
}


/////////////////
/// Cart Mode ///
/////////////////
var cart_mode_source = null;
var cart_mode_logs_box = document.getElementById('cart_mode_log_box')
var last_cart_mode_log_stamp = new Date().getTime()
function subscribeToCartMode(){

    if (cart_mode_source != null) {
        console.log("CLOSE CartMode EventSource");
        cart_mode_source.close();
    }
    if (typeof (EventSource) !== "undefined") {

        var cart_mode_topic = "/rt/jmoab/cart_mode"

        console.log("Subscribe to EventSource: " + zenoh_rest_url + scope + cart_mode_topic);
        cart_mode_source = new EventSource(zenoh_rest_url + scope + cart_mode_topic);
        cart_mode_source.addEventListener("PUT", function (e) {
            let sample = JSON.parse(e.data);
            let reader = new jscdr.CDRReader(dcodeIO.ByteBuffer.fromBase64(sample.value));
            let cart_mode = Int8.decode(reader);
            let cart_mode_log_time = new Date().getTime()
            // console.log(cart_mode)
            if (cart_mode.data == 0){
                cart_mode_data = "HOLD"
            } else if (cart_mode.data == 1){
                cart_mode_data = "Radio Control"
            } else if (cart_mode.data == 2){
                cart_mode_data = "ROS Control"
            }
            
            let cart_mode_logs_text = cart_mode_log_time + " | " + cart_mode_data + "\n"

            let cart_mode_log_period = new Date().getTime() - last_cart_mode_log_stamp

            if (cart_mode_log_period > 200){
                cart_mode_logs_box.value += cart_mode_logs_text
                cart_mode_logs_box.scrollTop = cart_mode_logs_box.scrollHeight;
                last_cart_mode_log_stamp = new Date().getTime()
            }

            /// if length too big then reset value
            if (cart_mode_logs_box.value.length > 1000000){
                cart_mode_logs_box.value = null
            }
            

        }, false);


    }
}

function resetAllSubscriptions() {

    subscribeToScan();
    setCameraSrc();
    subscribeToCartMode()
    subscribeToWarning()


}


resetAllSubscriptions()