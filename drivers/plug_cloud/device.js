'use strict';

const HueDeviceCloud = require('../../lib/HueDeviceCloud');
const HueDevicePlug = require('../../lib/HueDevicePlug');

class HueDeviceCloudPlug extends HueDeviceCloud {

  static HUE_DEVICE_TYPE = HueDevicePlug.HUE_DEVICE_TYPE;

}

HueDeviceCloudPlug.prototype.onHueInit = HueDevicePlug.prototype.onHueInit;
HueDeviceCloudPlug.prototype.onHuePoll = HueDevicePlug.prototype.onHuePoll;

HueDeviceCloudPlug.prototype.onRenamed = HueDevicePlug.prototype.onRenamed;
HueDeviceCloudPlug.prototype.onCapabilityOnoff = HueDevicePlug.prototype.onCapabilityOnoff;

module.exports = HueDeviceCloudPlug;
