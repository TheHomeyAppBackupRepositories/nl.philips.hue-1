'use strict';

const HueDriverLocal = require('../../lib/HueDriverLocal');
const HueDriverMotionSensor = require('../../lib/HueDriverMotionSensor');

class HueDriverLocalMotionSensor extends HueDriverLocal {

}

HueDriverLocalMotionSensor.prototype.onHueInit = HueDriverMotionSensor.prototype.onHueInit;

HueDriverLocalMotionSensor.prototype.onPairGetDevices = HueDriverMotionSensor.prototype.onPairGetDevices;
HueDriverLocalMotionSensor.prototype.onPairListDevice = HueDriverMotionSensor.prototype.onPairListDevice;

module.exports = HueDriverLocalMotionSensor;
