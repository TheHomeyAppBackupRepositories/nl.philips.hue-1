'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceTapDial = require('../../lib/HueDeviceTapDial');

class HueDeviceLocalTapDial extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceTapDial.HUE_DEVICE_TYPE;
  static BUTTON_EVENT_MAP = HueDeviceTapDial.BUTTON_EVENT_MAP;

}

HueDeviceLocalTapDial.prototype.onHueInit = HueDeviceTapDial.prototype.onHueInit;
HueDeviceLocalTapDial.prototype.onHuePoll = HueDeviceTapDial.prototype.onHuePoll;

HueDeviceLocalTapDial.prototype.onRenamed = HueDeviceTapDial.prototype.onRenamed;

module.exports = HueDeviceLocalTapDial;
