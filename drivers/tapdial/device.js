'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceTapDial = require('../../lib/HueDeviceTapDial');

class HueDeviceLocalTapDial extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceTapDial.HUE_DEVICE_TYPE;
  static BUTTON_EVENT_MAP = HueDeviceTapDial.BUTTON_EVENT_MAP;

  onHueInit = HueDeviceTapDial.prototype.onHueInit;
  onHueDeleted = HueDeviceTapDial.prototype.onHueDeleted;
  convertDevice = HueDeviceTapDial.prototype.convertDevice;

  onHueEventUpdate = HueDeviceTapDial.prototype.onHueEventUpdate;

  onRenamed = HueDeviceTapDial.prototype.onRenamed;

}

module.exports = HueDeviceLocalTapDial;
