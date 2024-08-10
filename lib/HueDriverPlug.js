'use strict';

module.exports = class HueDriverPlug {

  async onPairGetDevices({ bridge }) {
    return bridge.getDevicesV2();
  }

  onPairListDevice({ device }) {
    this.log('Plug Device:', device.product_data.model_id, device.type, device.metadata.name, device.product_data.product_archetype);
    if (device.product_data.product_archetype !== 'plug') return null;
    return {};
  }

};
