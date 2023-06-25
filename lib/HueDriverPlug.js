'use strict';

module.exports = class HueDriverPlug {

  async onPairGetDevices({ bridge }) {
    return bridge.getLights();
  }

  onPairListDevice({ device }) {
    if (device.type !== 'On/Off plug-in unit') return null;
    return {};
  }

};
