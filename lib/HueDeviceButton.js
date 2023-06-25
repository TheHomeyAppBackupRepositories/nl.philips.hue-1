'use strict';

module.exports = class HueDeviceButton {

  static HUE_DEVICE_TYPE = 'sensor';

  async onHueInit() {
    this.log(`Device: ${this.device.name}, Model: ${this.device.modelid}`);
  }

  async onHuePoll() {
    if (!this.device.state) return;

    const {
      lastupdated,
      buttonevent,
    } = this.device.state;

    // Initial load, don't trigger a Flow when the app has just started
    if (typeof this.buttonevent === 'undefined') {
      this.lastupdated = lastupdated;
      this.buttonevent = buttonevent;
    } else if (lastupdated !== this.lastupdated) {
      if (buttonevent === 1002 || buttonevent === 1000) {
        this.homey.flow
          .getDeviceTriggerCard('button_button_pressed')
          .trigger(this)
          .catch(this.error);
      } else if (buttonevent === 1001 && buttonevent !== this.buttonevent) {
        this.homey.flow
          .getDeviceTriggerCard('button_button_held')
          .trigger(this)
          .catch(this.error);
      } else if (buttonevent === 1003 && buttonevent !== this.buttonevent) {
        this.homey.flow
          .getDeviceTriggerCard('button_button_released')
          .trigger(this)
          .catch(this.error);
      }

      this.lastupdated = lastupdated;
      this.buttonevent = buttonevent;
    }
  }

  async onRenamed(name) {
    if (!this.bridge) return;

    await this.bridge.setSensorName({
      name,
      id: this.device.id,
    });
  }

};
