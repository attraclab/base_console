var lockAxis = false
var gotFirstTouch = false
var gotFirstClick = false
var touched_device = false

window.addEventListener("touchstart", (event) => {

    if ((gotFirstTouch === false) && (gotFirstClick === false)){

        lockAxis = true
        console.log("touch")

        initNipple(lockAxis)
        gotFirstTouch = true

        change_text()

        touched_device = true
        
    }
    

});

window.addEventListener("click", (event) => {

    if ((gotFirstClick === false) && (gotFirstTouch === false)){

        lockAxis = false
        console.log("click")

        initNipple(lockAxis)
        gotFirstClick = true

        remove_text()
        touched_device = false

    }

})

function remove_text(){
    document.getElementById('left_text').innerHTML = " "
    document.getElementById('right_text').innerHTML = " "
}
function change_text(){
    document.getElementById('left_text').innerHTML = "throttle"
    document.getElementById('right_text').innerHTML = "steering"
}

///////////////////////
/// Nipple Jotstick ///
///////////////////////

var thr_stick = 0;
var str_stick = 0;

var vx_input_scale = 1.0
var wz_input_scale = 1.0

var vx_display = document.getElementById("vx_box")
var wz_display = document.getElementById("wz_box")

var vx_input_box = document.getElementById('vx_input_box')
var wz_input_box = document.getElementById('wz_input_box')

var vx = 0.0;
var wz = 0.0;

var left_end = true;
var right_end = true

var pub_zero_once = true

function initNipple(lock_axis){

    var left_options = {
        zone: document.getElementById('left_nipple'),
        threshold: 0.1,
        position: { left: "50%", top: "50%"},
        mode: 'static',
        size: 300,
        color: '#228f77',
        dynamicPage: true,
        lockY: lock_axis,
      };
      
    const left_manager = nipplejs.create(left_options);
    left_manager.on('start', function (event, nipple) {
        console.log("Left start");
        left_end = false
        pub_zero_once = true
    });

    var right_options = {
        zone: document.getElementById('right_nipple'),
        threshold: 0.1,
        position: { left: "50%", top: "50%"},
        mode: 'static',
        size: 300,
        color: '#228f77',
        dynamicPage: true,
        lockX: lock_axis,
      };
      
    const right_manager = nipplejs.create(right_options);
    right_manager.on('start', function (event, nipple) {
        console.log("Right start");
        right_end = false
        pub_zero_once = true
    });

    left_manager.on('move', function (event, nipple) {
        console.log("Left Moving");
        
        if (left_options.lockY === true){
            thr_stick = Math.sin(nipple.angle.radian) * nipple.distance / left_options.size * 2;
            vx = thr_stick * vx_input_box.value
        } else {
            thr_stick = Math.sin(nipple.angle.radian) * nipple.distance / left_options.size * 2;
            str_stick = Math.cos(nipple.angle.radian) * nipple.distance / left_options.size * 2;
            vx = thr_stick * vx_input_box.value
            wz = -str_stick * wz_input_box.value
        }

        left_end = false
        pub_zero_once = true
        
    });
    
    left_manager.on('end', function () {

        left_end = true
    
    });
    
    right_manager.on('move', function (event, nipple) {
        console.log("Right Moving");
        if (right_options.lockX === true){
            str_stick = Math.cos(nipple.angle.radian) * nipple.distance / right_options.size * 2;
            wz = -str_stick * wz_input_box.value

        } else {
            thr_stick = Math.sin(nipple.angle.radian) * nipple.distance / right_options.size * 2;
            str_stick = Math.cos(nipple.angle.radian) * nipple.distance / right_options.size * 2;
            vx = thr_stick * vx_input_box.value
            wz = -str_stick * wz_input_box.value

        }

        right_end = false
        pub_zero_once = true


    });
    
    right_manager.on('end', function () {
    
        // vx_display.innerText = 0.0
        // wz_display.innerText = 0.0
        right_end = true
    
    });

}

////////////////////
/// Teleop loop ///
///////////////////
var teleop_interval = setInterval(teleop_loop, 200)


function teleop_loop(){

    if (touched_device === true){
        if (left_end === true){
            vx = 0.0
        }

        if (right_end === true){
            wz = 0.0
        }

        /// either of left or right still moving
        if ((left_end === false) || (right_end === false)){
            pubTwist(vx, wz)
            console.log(vx,wz)
        } else {
            if (pub_zero_once === true){
                console.log("touched device stop moving left/right")
                for (var i=0; i<5; i++){
                    pubTwist(0.0, 0.0)
                }
                pub_zero_once = false
            }
        }
    } else {
        if ((left_end === true) && (right_end === true)){

            vx = 0.0
            wz = 0.0
            if (pub_zero_once === true){
                console.log("click device stop moving left/right")
                for (var i=0; i<5; i++){
                    pubTwist(0.0, 0.0)
                }
                pub_zero_once = false
            }
            
        } else {
            pubTwist(vx, wz)
            console.log(vx,wz)
        }
    }
    


}


