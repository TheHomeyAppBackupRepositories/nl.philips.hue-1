'use strict';

module.exports = class HueDriverButton {

  async onPairGetDevices({ bridge }) {
    return bridge.getSensors();
  }

  onPairListDevice({ device }) {
    this.log('Module Device:', device.modelid, device.type, device.name);

    if (!['RDM001'].includes(device.modelid)) return null;
    return {};
  }

};
