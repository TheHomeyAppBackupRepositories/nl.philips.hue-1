'use strict';

const HueDeviceLocal = require('../../lib/HueDeviceLocal');
const HueDeviceModule = require('../../lib/HueDeviceModule');

class HueDeviceLocalModule extends HueDeviceLocal {

  static HUE_DEVICE_TYPE = HueDeviceModule.HUE_DEVICE_TYPE;
  static SWITCH_MODE_SETTING_KEY = HueDeviceModule.SWITCH_MODE_SETTING_KEY;

  onHueInit = HueDeviceModule.prototype.onHueInit;
  onHueDeleted = HueDeviceModule.prototype.onHueDeleted;

  onHueEventUpdate = HueDeviceModule.prototype.onHueEventUpdate;

  syncModeCapabilities = HueDeviceModule.prototype.syncModeCapabilities;

  onRenamed = HueDeviceModule.prototype.onRenamed;
  onSettings = HueDeviceModule.prototype.onSettings;

}

module.exports = HueDeviceLocalModule;
