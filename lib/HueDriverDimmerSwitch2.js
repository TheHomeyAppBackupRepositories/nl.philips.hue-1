'use strict';

const HueDriverDimmerSwitch = require('./HueDriverDimmerSwitch');

module.exports = class HueDriverDimmerSwitch2 extends HueDriverDimmerSwitch {

  onPairListDevice({ device }) {
    this.log('Dimmer Switch 2 Device:', device.product_data.model_id, device.type, device.metadata.name);

    if (!['RWL022'].includes(device.product_data.model_id)) return null;
    return {};
  }

};
