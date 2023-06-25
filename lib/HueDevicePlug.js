'use strict';

module.exports = class HueDevicePlug {

  static HUE_DEVICE_TYPE = 'light';

  async onHueInit() {
    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));

    this.log(`Device: ${this.device.name}, Model: ${this.device.modelid}`);
  }

  async onHuePoll() {
    if (!this.device.state) return;

    this.setCapabilityValue('onoff', !!this.device.state.on).catch(this.error);
  }

  async onRenamed(name) {
    if (!this.bridge) return;

    await this.bridge.setLightName({
      name,
      id: this.device.id,
    });
  }

  async onCapabilityOnoff(value) {
    return this.bridge.setLightState({
      state: {
        on: !!value,
      },
      id: this.device.id,
    });
  }

};
