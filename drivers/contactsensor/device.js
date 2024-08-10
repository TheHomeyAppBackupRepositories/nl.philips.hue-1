'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceContactSensor = require('../../lib/HueDeviceContactSensor');

class HueDeviceLocalContactSensor extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceContactSensor.HUE_DEVICE_TYPE;

  onHueInit = HueDeviceContactSensor.prototype.onHueInit;
  onHueDeleted = HueDeviceContactSensor.prototype.onHueDeleted;

  onHueEventUpdate = HueDeviceContactSensor.prototype.onHueEventUpdate;

  onRenamed = HueDeviceContactSensor.prototype.onRenamed;

  enableContactSensor = HueDeviceContactSensor.prototype.enableContactSensor;

}

module.exports = HueDeviceLocalContactSensor;
