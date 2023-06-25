'use strict';

module.exports = class HueDriverTap {

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
    this.log('Tap Device:', device.modelid, device.type, device.name);

    if (!['ZGPSwitch'].includes(device.type)) return null;
    return {};
  }

};
