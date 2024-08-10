'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceDimmerSwitch2 = require('../../lib/HueDeviceDimmerSwitch2');

class HueDeviceLocalDimmerSwitch2 extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceDimmerSwitch2.HUE_DEVICE_TYPE;
  static BUTTON_EVENT_MAP = HueDeviceDimmerSwitch2.BUTTON_EVENT_MAP;

  onHueInit = HueDeviceDimmerSwitch2.prototype.onHueInit;
  onHueDeleted = HueDeviceDimmerSwitch2.prototype.onHueDeleted;

  onHueEventUpdate = HueDeviceDimmerSwitch2.prototype.onHueEventUpdate;

  onRenamed = HueDeviceDimmerSwitch2.prototype.onRenamed;

}

module.exports = HueDeviceLocalDimmerSwitch2;
