'use strict';

module.exports = class HueDeviceTap {

  static HUE_DEVICE_TYPE = 'sensor';

  async onHueInit() {
    const id = this.getStoreValue('deviceIdV2');
    const services = this.getStoreValue('servicesV2');

    this.log(`Device: ${this.device.metadata.name}, Model: ${this.device.product_data.model_id}, UUID: ${id}`);

    // Create a mapping from V2 button UUIDs to button locations
    const buttonMapping = {};

    // The buttons are ordered in the services list
    let buttonIndex = 0;

    for (const service of services) {
      if (service.rtype === 'button') {
        buttonMapping[service.rid] = ++buttonIndex;
      }
    }

    this.buttonMapping = buttonMapping;

    this.bridge.registerV2(id, this);
    for (const button of Object.keys(buttonMapping)) {
      this.bridge.registerV2(button, this);
    }

    this.log('Button Mapping:', this.buttonMapping);
  }

  async onHueDeleted() {
    this.bridge.unregisterV2(await this.getDeviceIdV2());
    for (const button of Object.keys(this.buttonMapping)) {
      this.bridge.unregisterV2(button);
    }
  }

  async onHueEventUpdate(update) {
    if (update.type === 'button' && update.button.last_event !== undefined) {
      const triggerFlow = (flowId, buttonArg) => {
        this.log('Trigger flow', flowId, buttonArg);
        this.homey.flow
          .getDeviceTriggerCard(flowId)
          .trigger(this, {}, { button: buttonArg })
          .catch(this.error);
      };

      const button = this.buttonMapping[update.id];
      const buttonEvent = update.button.last_event;

      this.log('Button update', button, buttonEvent);

      const buttonArg = `button${button}`;

      switch (buttonEvent) {
        case 'initial_press':
          triggerFlow('tap_button_pressed', buttonArg);
          break;
        default:
          break;
      }
    } else {
      this.error('Unknown update:', JSON.stringify(update));
    }
  }

  async onRenamed(name) {
    if (!this.bridge) return;

    await this.bridge.setDeviceNameV2({
      name,
      id: await this.getDeviceIdV2(),
    });
  }

};
