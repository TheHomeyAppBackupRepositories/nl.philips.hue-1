'use strict';

module.exports = class HueDriverTapDial {

  async onHueInit() {
    const buttonTriggers = [
      `${this.id}_button_pressed`,
    ];

    for (const buttonTrigger of buttonTriggers) {
      this.homey.flow
        .getDeviceTriggerCard(buttonTrigger)
        .registerRunListener(async (args, state) => {
          return args.button === state.button;
        });
    }

    this.homey.flow
      .getDeviceTriggerCard(`${this.id}_dial_rotation_stopped`)
      .registerRunListener(async (args, state) => {
        return args.rotate_direction === 'either' || args.rotate_direction === state.rotate_direction;
      });
    this.homey.flow
      .getDeviceTriggerCard(`${this.id}_dial_rotation_started`)
      .registerRunListener(async (args, state) => {
        return args.rotate_direction === 'either' || args.rotate_direction === state.rotate_direction;
      });
  }

  async onPairGetDevices({ bridge }) {
    return bridge.getDevicesV2();
  }

  onPairListDevice({ device }) {
    this.log('Tap Dial Device:', device.product_data.model_id, device.type, device.metadata.name);

    if (!['RDM002'].includes(device.product_data.model_id)) return null;
    return {};
  }

};
