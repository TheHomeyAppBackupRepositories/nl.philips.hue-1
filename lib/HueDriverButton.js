'use strict';

module.exports = class HueDriverButton {

  async onPairGetDevices({ bridge }) {
    return bridge.getDevicesV2();
  }

  onPairListDevice({ device }) {
    this.log('Button Device:', device.product_data.model_id, device.type, device.metadata.name);

    if (!['ROM001', 'RDM003'].includes(device.product_data.model_id)) return null;
    return {};
  }

};
