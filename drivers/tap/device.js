'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceTap = require('../../lib/HueDeviceTap');

class HueDeviceLocalTap extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceTap.HUE_DEVICE_TYPE;

}

HueDeviceLocalTap.prototype.onHueInit = HueDeviceTap.prototype.onHueInit;
HueDeviceLocalTap.prototype.onHuePoll = HueDeviceTap.prototype.onHuePoll;

HueDeviceLocalTap.prototype.onRenamed = HueDeviceTap.prototype.onRenamed;

module.exports = HueDeviceLocalTap;
