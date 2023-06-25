'use strict';

module.exports = class HueDriverButton {

  async onPairGetDevices({ bridge }) {
    return bridge.getSensors();
  }

  onPairListDevice({ device }) {
    this.log('Button Device:', device.modelid, device.type, device.name);

    if (!['ROM001'].includes(device.modelid)) return null;
    return {};
  }

};
