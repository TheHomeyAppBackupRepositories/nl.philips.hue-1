'use strict';

const Homey = require('homey');
const HueDevice = require('./HueDevice');

class HueDeviceLocal extends Homey.Device {

  static HUE_DEVICE_TYPE = null;

  async onInit(...props) {
    this.homey.app.discovery.enableDiscovery();
    return HueDevice.prototype.onInit.call(this, ...props);
  }

}

// HueDeviceLocal.prototype.onInit = HueDevice.prototype.onInit;
HueDeviceLocal.prototype.onDeleted = HueDevice.prototype.onDeleted;

HueDeviceLocal.prototype.onHueInit = HueDevice.prototype.onHueInit;
HueDeviceLocal.prototype.onHuePoll = HueDevice.prototype.onHuePoll;
HueDeviceLocal.prototype.onHueDeleted = HueDevice.prototype.onHueDeleted;
HueDeviceLocal.prototype.getDeviceIdV2 = HueDevice.prototype.getDeviceIdV2;

module.exports = HueDeviceLocal;
