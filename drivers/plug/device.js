'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDevicePlug = require('../../lib/HueDevicePlug');

class HueDeviceLocalPlug extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDevicePlug.HUE_DEVICE_TYPE;

}

HueDeviceLocalPlug.prototype.onHueInit = HueDevicePlug.prototype.onHueInit;
HueDeviceLocalPlug.prototype.onHuePoll = HueDevicePlug.prototype.onHuePoll;

HueDeviceLocalPlug.prototype.onRenamed = HueDevicePlug.prototype.onRenamed;
HueDeviceLocalPlug.prototype.onCapabilityOnoff = HueDevicePlug.prototype.onCapabilityOnoff;

module.exports = HueDeviceLocalPlug;
