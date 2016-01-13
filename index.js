
var gpio = require("pi-gpio");
var async = require("async");

var PwmDriver = require('adafruit-i2c-pwm-driver');

var pwm = new PwmDriver(0x40, '/dev/i2c-1', true);
pwm.setPWMFreq(60) // Set frequency to 60 Hz


var servoMin = 150  // Min pulse length out of 4096
var servoMax = 600  // Max pulse length out of 4096

var devices = {};

// pins = {1:GPIONUMBER1, 2: GPIONUMBER2[, 3:.., 4:...]}
// pwm = {1:pwmchannel1[, 2: pwmchannel2]}
// name = device name
var init = function(name, pins, pwm, callback) {
	if(callback == undefined){
		callback = function(){};
	}

    devices[name] = {pins: pins, pwm: pwm};
    //open GPIO
	async.forEachOf(pins, function (value, key, callback) {
		gpio.open(value, "output", calback);
	}, callback);
};

// speed in [0, 1];
var setPwm = function(name, motor, speed) {
	pwm.setPWM(devices[name].pwm[motor], 0, 4096*speed);
};

// direction is +1 or -1
var setPins = function(name, motor, direction, callback) {

	if(callback == undefined){
		callback = function(){};
	}
	var pin1;
	var pin2;
	if(direction >= 0) {
		pin1 = 1;
		pin2 = 0;
	} else {
		pin1 = 0;
		pin2 = 1;
	}

	async.parallel([
	    function(callback){
	        gpio.write(devices[name].pins[motor*2+1], 1, callback);
	    },
	    function(callback){
	        gpio.write(devices[name].pins[motor*2+2], 1, callback);
	    }
	],callback);
};

// motor = 0 || 1
// speed in [-1, 1]
var setSpeed = function(name, motor, speed) {
	if(speed > 0){
		setPins(name, motor, 1);
	}else {
		setPins(name, motor, -1);
		speed = -speed;
	}
	setPwm(name, motor, speed);
};


init("droite", {1:5,2:6,3:13,4:19}, {1: 0, 2: 1});
init("gauche", {1:26,2:12,3:16,4:20}, {1: 2, 2: 3});

var sens = 1;
setTimeout(function(){

	setSpeed("droite", 0, 0.7*sens);
	setSpeed("droite", 1, 0.7*sens);
	setSpeed("gauche", 0, 0.7*sens);
	setSpeed("gauche", 1, 0.7*sens);

	sens = -sens;

}, 3000);

