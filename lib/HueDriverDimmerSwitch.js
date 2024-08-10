'use strict';

module.exports = class HueDriverDimmerSwitch {

  async onHueInit() {
    this.homey.flow
      .getDeviceTriggerCard(`${this.id}_button_pressed`)
      .registerRunListener(async (args, state) => {
        return args.button === state.button;
      });
  }

  async onPairGetDevices({ bridge }) {
    return bridge.getDevicesV2();
  }

  onPairListDevice({ device }) {
    this.log('Dimmer Switch Device:', device.product_data.model_id, device.type, device.metadata.name);

    if (!['RWL020', 'RWL021'].includes(device.product_data.model_id)) return null;
    return {};
  }

};
