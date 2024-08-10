'use strict';

const HueDeviceCloud = require('../../lib/HueDeviceCloud');
const HueDeviceBulb = require('../../lib/HueDeviceBulb');

class HueDeviceCloudBulb extends HueDeviceCloud {

  static HUE_DEVICE_TYPE = HueDeviceBulb.HUE_DEVICE_TYPE;

}

HueDeviceCloudBulb.prototype.onHueInit = HueDeviceBulb.prototype.onHueInit;
HueDeviceCloudBulb.prototype.onHueEventUpdate = HueDeviceBulb.prototype.onHueEventUpdate;

HueDeviceCloudBulb.prototype.onRenamed = HueDeviceBulb.prototype.onRenamed;
HueDeviceCloudBulb.prototype.onCapabilityAll = HueDeviceBulb.prototype.onCapabilityAll;

HueDeviceCloudBulb.prototype.setLightStateV2 = HueDeviceBulb.prototype.setLightStateV2;
HueDeviceCloudBulb.prototype.setEffect = HueDeviceBulb.prototype.setEffect;
HueDeviceCloudBulb.prototype.alertV2 = HueDeviceBulb.prototype.alertV2;

HueDeviceCloudBulb.prototype.setLightState = HueDeviceBulb.prototype.setLightState;
HueDeviceCloudBulb.prototype.shortAlert = HueDeviceBulb.prototype.shortAlert;
HueDeviceCloudBulb.prototype.longAlert = HueDeviceBulb.prototype.longAlert;
HueDeviceCloudBulb.prototype.startColorLoop = HueDeviceBulb.prototype.startColorLoop;
HueDeviceCloudBulb.prototype.stopColorLoop = HueDeviceBulb.prototype.stopColorLoop;
HueDeviceCloudBulb.prototype.setGradient = HueDeviceBulb.prototype.setGradient;

module.exports = HueDeviceCloudBulb;
