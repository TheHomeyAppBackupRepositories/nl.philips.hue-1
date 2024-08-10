'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceMotionSensor = require('../../lib/HueDeviceMotionSensor');

class HueDeviceLocalMotionSensor extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceMotionSensor.HUE_DEVICE_TYPE;

  onHueInit = HueDeviceMotionSensor.prototype.onHueInit;
  onHueDeleted = HueDeviceMotionSensor.prototype.onHueDeleted;

  onHueEventUpdate = HueDeviceMotionSensor.prototype.onHueEventUpdate;

  onRenamed = HueDeviceMotionSensor.prototype.onRenamed;

  enableMotionSensor = HueDeviceMotionSensor.prototype.enableMotionSensor;

}

module.exports = HueDeviceLocalMotionSensor;
