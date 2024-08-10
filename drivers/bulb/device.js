'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceBulb = require('../../lib/HueDeviceBulb');

class HueDeviceLocalBulb extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceBulb.HUE_DEVICE_TYPE;

}

HueDeviceLocalBulb.prototype.onHueInit = HueDeviceBulb.prototype.onHueInit;
HueDeviceLocalBulb.prototype.onHueEventUpdate = HueDeviceBulb.prototype.onHueEventUpdate;

HueDeviceLocalBulb.prototype.onRenamed = HueDeviceBulb.prototype.onRenamed;
HueDeviceLocalBulb.prototype.onCapabilityAll = HueDeviceBulb.prototype.onCapabilityAll;

HueDeviceLocalBulb.prototype.setLightStateV2 = HueDeviceBulb.prototype.setLightStateV2;
HueDeviceLocalBulb.prototype.setEffect = HueDeviceBulb.prototype.setEffect;
HueDeviceLocalBulb.prototype.alertV2 = HueDeviceBulb.prototype.alertV2;

HueDeviceLocalBulb.prototype.setLightState = HueDeviceBulb.prototype.setLightState;
HueDeviceLocalBulb.prototype.shortAlert = HueDeviceBulb.prototype.shortAlert;
HueDeviceLocalBulb.prototype.longAlert = HueDeviceBulb.prototype.longAlert;
HueDeviceLocalBulb.prototype.startColorLoop = HueDeviceBulb.prototype.startColorLoop;
HueDeviceLocalBulb.prototype.stopColorLoop = HueDeviceBulb.prototype.stopColorLoop;
HueDeviceLocalBulb.prototype.setGradient = HueDeviceBulb.prototype.setGradient;

module.exports = HueDeviceLocalBulb;
