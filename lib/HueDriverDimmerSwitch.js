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
    return bridge.getSensors();
  }

  onPairListDevice({ device }) {
    this.log('Dimmer Switch Device:', device.modelid, device.type, device.name);

    if (!['RWL020', 'RWL021'].includes(device.modelid)) return null;
    return {};
  }

};
