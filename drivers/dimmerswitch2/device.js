'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceDimmerSwitch2 = require('../../lib/HueDeviceDimmerSwitch2');

class HueDeviceLocalDimmerSwitch2 extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceDimmerSwitch2.HUE_DEVICE_TYPE;
  static BUTTON_EVENT_MAP = HueDeviceDimmerSwitch2.BUTTON_EVENT_MAP;

}

HueDeviceLocalDimmerSwitch2.prototype.onHueInit = HueDeviceDimmerSwitch2.prototype.onHueInit;
HueDeviceLocalDimmerSwitch2.prototype.onHuePoll = HueDeviceDimmerSwitch2.prototype.onHuePoll;

HueDeviceLocalDimmerSwitch2.prototype.onRenamed = HueDeviceDimmerSwitch2.prototype.onRenamed;

module.exports = HueDeviceLocalDimmerSwitch2;
