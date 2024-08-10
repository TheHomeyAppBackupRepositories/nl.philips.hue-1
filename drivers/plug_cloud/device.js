'use strict';

const HueDeviceCloud = require('../../lib/HueDeviceCloud');
const HueDevicePlug = require('../../lib/HueDevicePlug');

class HueDeviceCloudPlug extends HueDeviceCloud {

  static HUE_DEVICE_TYPE = HueDevicePlug.HUE_DEVICE_TYPE;

  onHueInit = HueDevicePlug.prototype.onHueInit;
  onHueDeleted = HueDevicePlug.prototype.onHueDeleted;

  onHueEventUpdate = HueDevicePlug.prototype.onHueEventUpdate;

  onRenamed = HueDevicePlug.prototype.onRenamed;

  onCapabilityOnoff = HueDevicePlug.prototype.onCapabilityOnoff;

}

module.exports = HueDeviceCloudPlug;
