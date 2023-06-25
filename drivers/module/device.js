'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceModule = require('../../lib/HueDeviceModule');

class HueDeviceLocalModule extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceModule.HUE_DEVICE_TYPE;

}

HueDeviceLocalModule.prototype.onHueInit = HueDeviceModule.prototype.onHueInit;
HueDeviceLocalModule.prototype.onHuePoll = HueDeviceModule.prototype.onHuePoll;

HueDeviceLocalModule.prototype.onRenamed = HueDeviceModule.prototype.onRenamed;

module.exports = HueDeviceLocalModule;
