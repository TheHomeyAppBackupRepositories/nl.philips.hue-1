'use strict';

const HueDriverDimmerSwitch = require('./HueDriverDimmerSwitch');

module.exports = class HueDriverDimmerSwitch2 extends HueDriverDimmerSwitch {

  onPairListDevice({ device }) {
    this.log('Dimmer Switch Device:', device.modelid, device.type, device.name);

    if (!['RWL022'].includes(device.modelid)) return null;
    return {};
  }

};
