'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDevicePlug = require('../../lib/HueDevicePlug');

class HueDeviceLocalPlug extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDevicePlug.HUE_DEVICE_TYPE;

  onHueInit = HueDevicePlug.prototype.onHueInit;
  onHueDeleted = HueDevicePlug.prototype.onHueDeleted;

  onHueEventUpdate = HueDevicePlug.prototype.onHueEventUpdate;

  onRenamed = HueDevicePlug.prototype.onRenamed;

  onCapabilityOnoff = HueDevicePlug.prototype.onCapabilityOnoff;

}

module.exports = HueDeviceLocalPlug;
