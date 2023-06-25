'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceMotionSensor = require('../../lib/HueDeviceMotionSensor');

class HueDeviceLocalMotionSensor extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceMotionSensor.HUE_DEVICE_TYPE;

}

HueDeviceLocalMotionSensor.prototype.onHueInit = HueDeviceMotionSensor.prototype.onHueInit;
HueDeviceLocalMotionSensor.prototype.onHuePoll = HueDeviceMotionSensor.prototype.onHuePoll;

HueDeviceLocalMotionSensor.prototype.onRenamed = HueDeviceMotionSensor.prototype.onRenamed;

HueDeviceLocalMotionSensor.prototype.enableMotionSensor = HueDeviceMotionSensor.prototype.enableMotionSensor;
HueDeviceLocalMotionSensor.prototype.disableMotionSensor = HueDeviceMotionSensor.prototype.disableMotionSensor;

module.exports = HueDeviceLocalMotionSensor;
