'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceBulb = require('../../lib/HueDeviceBulb');

class HueDeviceLocalBulb extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceBulb.HUE_DEVICE_TYPE;

}

HueDeviceLocalBulb.prototype.onHueInit = HueDeviceBulb.prototype.onHueInit;
HueDeviceLocalBulb.prototype.onHuePoll = HueDeviceBulb.prototype.onHuePoll;

HueDeviceLocalBulb.prototype.onRenamed = HueDeviceBulb.prototype.onRenamed;
HueDeviceLocalBulb.prototype.onCapabilityAll = HueDeviceBulb.prototype.onCapabilityAll;

HueDeviceLocalBulb.prototype.setLightState = HueDeviceBulb.prototype.setLightState;
HueDeviceLocalBulb.prototype.shortAlert = HueDeviceBulb.prototype.shortAlert;
HueDeviceLocalBulb.prototype.longAlert = HueDeviceBulb.prototype.longAlert;
HueDeviceLocalBulb.prototype.startColorLoop = HueDeviceBulb.prototype.startColorLoop;
HueDeviceLocalBulb.prototype.stopColorLoop = HueDeviceBulb.prototype.stopColorLoop;
HueDeviceLocalBulb.prototype.setGradient = HueDeviceBulb.prototype.setGradient;

module.exports = HueDeviceLocalBulb;
