'use strict';

const { OAuth2Device } = require('homey-oauth2app');

const HueDevice = require('./HueDevice');

class HueDeviceCloud extends OAuth2Device {

  static HUE_DEVICE_TYPE = null;

}

HueDeviceCloud.prototype.onOAuth2Init = HueDevice.prototype.onInit;
HueDeviceCloud.prototype.onOAuth2Uninit = HueDevice.prototype.onUninit;
HueDeviceCloud.prototype.onOAuth2Deleted = HueDevice.prototype.onDeleted;

HueDeviceCloud.prototype.onHueInit = HueDevice.prototype.onHueInit;
HueDeviceCloud.prototype.onHuePoll = HueDevice.prototype.onHuePoll;
HueDeviceCloud.prototype.onHueEventUpdate = HueDevice.prototype.onHueEventUpdate;
HueDeviceCloud.prototype.onHueDeleted = HueDevice.prototype.onHueDeleted;
HueDeviceCloud.prototype.convertDevice = HueDevice.prototype.convertDevice;
HueDeviceCloud.prototype.getDeviceIdV2 = HueDevice.prototype.getDeviceIdV2;

module.exports = HueDeviceCloud;
