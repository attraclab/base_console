// ROS2 Time type
class Time {
    constructor(sec, nsec) {
        this.sec = sec;
        this.nsec = nsec;
    }

    encode(cdrWriter){
        cdrWriter.writeInt32(this.sec)
        cdrWriter.writeUint32(this.nsec)
    }

    static decode(cdrReader) {
        let sec = cdrReader.readInt32();
        let nsec = cdrReader.readUint32();
        return new Time(sec, nsec);
    }
}

// ROS2 Log type (received in 'rosout' topic)
class Log {
    constructor(time, level, name, msg, file, fn, line) {
        this.time = time;
        this.level = level;
        this.name = name;
        this.msg = msg;
        this.file = file;
        this.fn = fn;
        this.line = line;
    }

    static decode(cdrReader) {
        let time = Time.decode(cdrReader);
        let level = cdrReader.readByte();
        let name = cdrReader.readString();
        let msg = cdrReader.readString();
        let file = cdrReader.readString();
        let fn = cdrReader.readString();
        let line = cdrReader.readUint32();
        return new Log(time, level, name, msg, file, fn, line);
    }
}

// ROS2 Vector3 type
class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    encode(cdrWriter) {
        cdrWriter.writeFloat64(this.x);
        cdrWriter.writeFloat64(this.y);
        cdrWriter.writeFloat64(this.z);
    }

    static decode(cdrReader) {
        let x = cdrReader.readFloat64();
        let y = cdrReader.readFloat64();
        let z = cdrReader.readFloat64();
        return new Vector3(x, y, z);
    }
}

// ROS2 Quaternion_msg type
class Quaternion_msg {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    encode(cdrWriter){
        cdrWriter.writeFloat64(this.x)
        cdrWriter.writeFloat64(this.y)
        cdrWriter.writeFloat64(this.z)
        cdrWriter.writeFloat64(this.w)
    }

    static decode(cdrReader) {
        let x = cdrReader.readFloat64();
        let y = cdrReader.readFloat64();
        let z = cdrReader.readFloat64();
        let w = cdrReader.readFloat64();
        return new Quaternion_msg(x, y, z, w);
    }
}

// ROS2 Twist type (published in 'cmd_vel' topic)
class Twist {
    constructor(linear, angular) {
        this.linear = linear;
        this.angular = angular;
    }

    encode(cdrWriter) {
        this.linear.encode(cdrWriter);
        this.angular.encode(cdrWriter);
    }
}

// ROS2 Header type
class Header {
    constructor(time, frame_id) {
        this.time = time;
        this.frame_id = frame_id;
    }

    encode(cdrWriter){
        // cdrWriter.writeUint32(0)
        this.time.encode(cdrWriter)
        // console.log(this.frame_id)
        cdrWriter.writeString(this.frame_id)
        // cdrWriter.writeUint32(0)
        
    }

    static decode(cdrReader) {
        let time = Time.decode(cdrReader);
        let frame_id = cdrReader.readString();

        return new Header(time, frame_id)
    }
}


// LaserScan (Lidar publications)
class LaserScan {
    constructor(header, angle_min, angle_max, angle_increment, time_increment, scan_time, range_min, range_max, ranges, intensities) {
        this.header = header;
        this.angle_min = angle_min;
        this.angle_max = angle_max;
        this.angle_increment = angle_increment;
        this.time_increment = time_increment;
        this.scan_time = scan_time;
        this.range_min = range_min;
        this.range_max = range_max;
        this.ranges = ranges;
        this.intensities = intensities;
    }

    static decode(cdrReader) {
        let header = Header.decode(cdrReader);
        let angle_min = cdrReader.readFloat32();
        let angle_max = cdrReader.readFloat32();
        let angle_increment = cdrReader.readFloat32();
        let time_increment = cdrReader.readFloat32();
        let scan_time = cdrReader.readFloat32();
        let range_min = cdrReader.readFloat32();
        let range_max = cdrReader.readFloat32();

        let ranges_length = cdrReader.readInt32()
        let ranges = [];
        for (const x of Array(ranges_length).keys()) {
            ranges.push(cdrReader.readFloat32())
        }

        let intensities_length = cdrReader.readInt32()
        let intensities = [];
        for (const x of Array(intensities_length).keys()) {
            intensities.push(cdrReader.readFloat32())
        }
        return new LaserScan(header, angle_min, angle_max, angle_increment, time_increment, scan_time, range_min, range_max, ranges, intensities);
    }
}

// Imu
class Imu {
    constructor(header, orientation, orientation_covariance, angular_velocity, angular_velocity_convariance, linear_acceleration, linear_acceleration_covariance){
        this.header = header
        this.orientation = orientation
        this.orientation_covariance = orientation_covariance
        this.angular_velocity = angular_velocity
        this.angular_velocity_convariance = angular_velocity_convariance
        this.linear_acceleration = linear_acceleration
        this.linear_acceleration_covariance = linear_acceleration_covariance
    }

    static decode(cdrReader) {

        let header = Header.decode(cdrReader);

        let orientation = Quaternion_msg.decode(cdrReader)
        // console.log(orientation)
        // let orientation_covariance_length = cdrReader.readInt32()
        let orientation_covariance = []
        for (var i=0; i<9; i++) {
            orientation_covariance.push(cdrReader.readFloat64())
        }

        let angular_velocity = Vector3.decode(cdrReader)
        // let angular_velocity_convariance_length = cdrReader.readInt32()
        let angular_velocity_convariance = []
        for (var i=0; i<9; i++) {
            angular_velocity_convariance.push(cdrReader.readFloat64())
        }

        let linear_acceleration = Vector3.decode(cdrReader)
        // let linear_acceleration_covariance_length = cdrReader.readInt32()
        let linear_acceleration_covariance = []
        for (var i=0; i<9; i++) {
            linear_acceleration_covariance.push(cdrReader.readFloat64())
        }
        return new Imu(header, orientation, orientation_covariance, angular_velocity, angular_velocity_convariance, linear_acceleration, linear_acceleration_covariance)
    }
}

class MultiArrayDimension {
    constructor (label, size, stride){
        this.label = label
        this.size = size
        this.stride = stride
    }
    static decode(cdrReader){
        let label = cdrReader.readString()
        let size = cdrReader.readUint32()
        let stride = cdrReader.readUint32()

        return new MultiArrayDimension(label, size, stride)
    }
}

class Layout {
    constructor (dim, data_offset){

    }
    static decode(cdrReader){
        let dim = MultiArrayDimension.decode(cdrReader)
        let data_offset = cdrReader.readUint32()
        
        return new Layout(dim, data_offset)
    }

}

// SBUS //
class Int16MultiArray {
    // constructor(layout, data){
    //     this.layout = layout
    //     this.data = data
    // }
    constructor(data){
       
        this.data = data
    }

    static decode(cdrReader) {
        
        // first 2byte seems to be 0, so we just skip
        for(var i=0; i<2; i++){
            let a = cdrReader.readInt32()
            // console.log(i, a)
        }
        // next byte is array length
        let data_length = cdrReader.readInt32()
        let data = [];
        for (const x of Array(data_length).keys()) {
            data.push(cdrReader.readInt16())
        }
        
        return new Int16MultiArray(data)
    }
}

class Int8 {
    constructor(data){
        this.data = data
    }

    encode(cdrWriter){
        cdrWriter.writeByte(this.data)
    }

    static decode(cdrReader){

        let data = cdrReader.readByte()
        return new Int8(data)
    }
}

class Float32 {
    constructor(data){
        this.data = data
    }

    encode(cdrWriter){
        cdrWriter.writeFloat32(this.data)
    }

    static decode(cdrReader){

        let data = cdrReader.readFloat32()
        return new Float32(data)
    }
}

class Int8MultiArray {
    constructor(data){
        this.data = data
    }

    encode(cdrWriter){

        let a = this.data.length
        cdrWriter.writeInt32(0)
        cdrWriter.writeInt32(0)
        cdrWriter.writeInt32(a)
        for(var i=0; i< a; i++){
            cdrWriter.writeByte(this.data[i])
            // console.log(i)
        }
        

    }
}

class ImageMsg {
    constructor(header, height, width, encoding, is_bigendian, step, data){
        this.header = header
        this.height = height
        this.width = width
        this.encoding = encoding
        this.is_bigendian = is_bigendian
        this.step = step
        this.data = data
    }

    static decode(cdrReader){

        let header = Header.decode(cdrReader);
        let height = cdrReader.readUint32();
        let width = cdrReader.readUint32();
        let encoding = cdrReader.readString();
        let is_bigendian = cdrReader.readByte()
        let step = cdrReader.readUint32()
        let data = []
        for (const h of Array(height).keys()) {
            for (const w of Array(width).keys()) {
                data.push(cdrReader.buf.readUint8());
                data.push(cdrReader.buf.readUint8());
                data.push(cdrReader.buf.readUint8());
                // data.push(cdrReader.readByte())
                // data.push(cdrReader.readByte())
                // data.push(cdrReader.readByte())
            }
        }

        return new ImageMsg(header, height, width, encoding, is_bigendian, step, data)
    }
}

class Transform {
    constructor(translation, rotation){
        this.translation = translation
        this.rotation = rotation
    }

    static decode(cdrReader){
        let translation = Vector3.decode(cdrReader)
        let rotation = Quaternion_msg.decode(cdrReader)

        return new Transform(translation, rotation)
    }
}
class Point {
    constructor(x,y,z){
        this.x = x
        this.y = y
        this.z = z
    }

    encode(cdrWriter){
        cdrWriter.writeFloat64(this.x)
        cdrWriter.writeFloat64(this.y)
        cdrWriter.writeFloat64(this.z)
    }

    static decode(cdrReader){
        let x = cdrReader.readFloat64()
        let y = cdrReader.readFloat64()
        let z = cdrReader.readFloat64()

        return new Point(x,y,z)
    }
}

class Pose {
    constructor(position, orientation){
        this.position = position
        this.orientation = orientation
    }

    encode(cdrWriter){
        this.position.encode(cdrWriter)
        this.orientation.encode(cdrWriter)
    }

    static decode(cdrReader){
        let position = Point.decode(cdrReader)
        let orientation = Quaternion_msg.decode(cdrReader)

        return new Pose(position,orientation)
    }
}

class PoseArray {
    constructor(header, poses){
        this.header = header
        this.poses = poses
    }

    encode(cdrWriter){
        // this.header.encode(cdrWriter)
        /// Hacking way to ignore header
        cdrWriter.writeInt32(0)
        cdrWriter.writeInt32(0)
        cdrWriter.writeInt32(0)
        let length = this.poses.length
        cdrWriter.writeInt32(length)
        for(var i=0; i< length; i++){
            this.poses[i].encode(cdrWriter)
            // console.log(i)
        }
        
    }

    static decode(cdrReader){
        let header = Header.decode(cdrReader);
        let length = cdrReader.readInt32()

        let poses = [];
        for (const x of Array(length).keys()) {
            poses.push(Pose.decode(cdrReader))
        }
        
        return new PoseArray(header, poses)
    }

}

class PoseStamped {
    constructor(header,pose){
        this.header = header
        this.pose = pose
    }

    encode(cdrWriter) {
        this.header.encode(cdrWriter)
        this.pose.encode(cdrWriter)

    }

    static decode(cdrReader){
        let header = Header.decode(cdrReader);
        let pose = Pose.decode(cdrReader)

        return new PoseStamped(header, pose)
    }
}

class Path {
    constructor(header, poses){
        this.header = header
        this.poses = poses
    }

    static decode(cdrReader){
        let header = Header.decode(cdrReader)
        let length = cdrReader.readInt32()
        let poses = []
        for (var i=0;i<length;i++){
            poses.push(PoseStamped.decode(cdrReader))
        }

        return new Path(header, poses)
    }
}

class Bool {
    constructor(data){
        this.data = data
    }

    encode(cdrWriter){
        cdrWriter.writeByte(this.data)
    }

    static decode(cdrReader){
        let data = cdrReader.readByte()
        return new Bool(data)
    }
    
}