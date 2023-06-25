'use strict';

module.exports = class HueDriverTapDial {

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
    this.log('Tap Dial Device:', device.modelid, device.type, device.name);

    if (!['ZLLSwitch'].includes(device.type)) return null;
    if (!['RDM002'].includes(device.modelid)) return null;
    return {};
  }

};
