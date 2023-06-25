'use strict';

module.exports = class HueDeviceTap {

  static HUE_DEVICE_TYPE = 'sensor';

  static BUTTON_MODELS = {
    ZGPSWITCH: 'ZGPSWITCH', // Hue Tap
    FOHSWITCH: 'FOHSWITCH', // Friends of Hue
  }

  static BUTTON_EVENT_MAP_ZGPSWITCH = {
    34: 'button1',
    16: 'button2',
    17: 'button3',
    18: 'button4',
  }

  static BUTTON_EVENT_MAP_FOHSWITCH = {
    20: 'button1',
    21: 'button2',
    22: 'button3',
    23: 'button4',
  };

  async onHueInit() {
    this.log(`Device: ${this.device.name}, Model: ${this.device.modelid}`);
  }

  async onHuePoll() {
    if (!this.device.state) return;

    const {
      modelid,
    } = this.device;

    const {
      lastupdated,
      buttonevent,
    } = this.device.state;

    let buttonEventMap;
    switch (modelid) {
      case HueDeviceTap.BUTTON_MODELS.ZGPSWITCH:
        buttonEventMap = HueDeviceTap.BUTTON_EVENT_MAP_ZGPSWITCH;
        break;
      case HueDeviceTap.BUTTON_MODELS.FOHSWITCH:
        buttonEventMap = HueDeviceTap.BUTTON_EVENT_MAP_FOHSWITCH;
        break;
      default:
        return;
    }

    // Initial load, don't trigger a Flow when the app has just started
    if (typeof this.buttonevent === 'undefined') {
      this.lastupdated = lastupdated;
      this.buttonevent = buttonevent;
    } else if (lastupdated !== this.lastupdated && buttonevent === this.buttonevent) {
      this.lastupdated = this.device.state.lastupdated;

      const button = buttonEventMap[buttonevent];
      this.log(`Same button pressed [${buttonevent}]:`, button);

      if (button) {
        this.homey.flow
          .getDeviceTriggerCard('tap_button_pressed')
          .trigger(this, {}, { button })
          .catch(this.error);
      }
    } else if (this.buttonevent !== buttonevent) {
      this.buttonevent = buttonevent;
      this.lastupdated = lastupdated;

      const button = buttonEventMap[buttonevent];
      this.log(`Different button pressed [${buttonevent}]:`, button);

      if (button) {
        this.homey.flow
          .getDeviceTriggerCard('tap_button_pressed')
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
