'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceDimmerSwitch = require('../../lib/HueDeviceDimmerSwitch');

class HueDeviceLocalDimmerSwitch extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceDimmerSwitch.HUE_DEVICE_TYPE;
  static BUTTON_EVENT_MAP = HueDeviceDimmerSwitch.BUTTON_EVENT_MAP;

  onHueInit = HueDeviceDimmerSwitch.prototype.onHueInit;
  onHueDeleted = HueDeviceDimmerSwitch.prototype.onHueDeleted;

  onHueEventUpdate = HueDeviceDimmerSwitch.prototype.onHueEventUpdate;

  onRenamed = HueDeviceDimmerSwitch.prototype.onRenamed;

}

module.exports = HueDeviceLocalDimmerSwitch;
