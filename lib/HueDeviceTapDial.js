'use strict';

module.exports = class HueDeviceTapDial {

  static HUE_DEVICE_TYPE = 'sensor';

  static BUTTON_EVENT_MAP = {
    1: 'button1',
    2: 'button2',
    3: 'button3',
    4: 'button4',
  };

  async onHueInit() {
    this.log(`Device: ${this.device.name}, Model: ${this.device.modelid}`);
  }

  async onHuePoll() {
    if (!this.device.state) return;
    if (!this.device.config) return;

    const battery = parseInt(this.device.config.battery, 10);
    if (typeof battery === 'number') {
      this.setCapabilityValue('measure_battery', battery).catch(this.error);
    }

    const { lastupdated } = this.device.state;
    let { buttonevent } = this.device.state;

    if (typeof buttonevent !== 'undefined') {
      buttonevent = String(buttonevent).substring(0, 1);
    }

    // Initial load, don't trigger a Flow when the app has just started
    if (typeof this.buttonevent === 'undefined') {
      this.buttonevent = buttonevent;
      this.lastupdated = lastupdated;
    } else if (lastupdated !== this.lastupdated && buttonevent === this.buttonevent) {
      this.lastupdated = lastupdated;

      const button = this.constructor.BUTTON_EVENT_MAP[buttonevent];
      this.log(`Same button pressed [${buttonevent}]:`, button);

      if (button) {
        this.homey.flow
          .getDeviceTriggerCard(`${this.driver.id}_button_pressed`)
          .trigger(this, {}, { button })
          .catch(this.error);
      }
    } else if (this.buttonevent !== buttonevent) {
      this.buttonevent = buttonevent;
      this.lastupdated = lastupdated;

      const button = this.constructor.BUTTON_EVENT_MAP[buttonevent];
      this.log(`Different button pressed [${buttonevent}]:`, button);

      if (button) {
        this.homey.flow
          .getDeviceTriggerCard(`${this.driver.id}_button_pressed`)
          .trigger(this, {}, { button })
          .catch(this.error);
      }
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
