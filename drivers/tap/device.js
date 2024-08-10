'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceTap = require('../../lib/HueDeviceTap');

class HueDeviceLocalTap extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceTap.HUE_DEVICE_TYPE;

  onHueInit = HueDeviceTap.prototype.onHueInit;
  onHueDeleted = HueDeviceTap.prototype.onHueDeleted;

  onHueEventUpdate = HueDeviceTap.prototype.onHueEventUpdate;

  onRenamed = HueDeviceTap.prototype.onRenamed;

}

module.exports = HueDeviceLocalTap;
