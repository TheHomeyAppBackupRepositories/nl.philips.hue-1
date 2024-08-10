'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceButton = require('../../lib/HueDeviceButton');

class HueDeviceLocalButton extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceButton.HUE_DEVICE_TYPE;

  onHueInit = HueDeviceButton.prototype.onHueInit;
  onHueDeleted = HueDeviceButton.prototype.onHueDeleted;

  onHueEventUpdate = HueDeviceButton.prototype.onHueEventUpdate;
  onRenamed = HueDeviceButton.prototype.onRenamed;

}

module.exports = HueDeviceLocalButton;
