'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceButton = require('../../lib/HueDeviceButton');

class HueDeviceLocalButton extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceButton.HUE_DEVICE_TYPE;

}

HueDeviceLocalButton.prototype.onHueInit = HueDeviceButton.prototype.onHueInit;
HueDeviceLocalButton.prototype.onHuePoll = HueDeviceButton.prototype.onHuePoll;

HueDeviceLocalButton.prototype.onRenamed = HueDeviceButton.prototype.onRenamed;

module.exports = HueDeviceLocalButton;
