'use strict';

module.exports = class HueDeviceButton {

  static HUE_DEVICE_TYPE = 'sensor';

  async onHueInit() {
    const id = this.getStoreValue('deviceIdV2');
    const services = this.getStoreValue('servicesV2');

    this.log(`Device: ${this.device.metadata.name}, Model: ${this.device.product_data.model_id}, UUID: ${id}`);

    for (const service of services) {
      if (service.rtype === 'button') {
        this.buttonId = service.rid;
        break;
      }
    }

    this.bridge.registerV2(id, this);
    this.bridge.registerV2(this.buttonId, this);

    this.log('Button:', this.buttonId);
  }

  async onHueDeleted() {
    this.bridge.unregisterV2(await this.getDeviceIdV2());
    this.bridge.unregisterV2(this.buttonId);
  }

  async onHueEventUpdate(update) {
    if (update.type === 'button' && update.button?.last_event !== undefined) {
      const triggerFlow = flowId => {
        this.log('Triggering flow', flowId);
        this.homey.flow
          .getDeviceTriggerCard(flowId)
          .trigger(this)
          .catch(this.error);
      };

      const buttonEvent = update.button.last_event;
      this.log('Button update', buttonEvent);
      switch (buttonEvent) {
        case 'initial_press':
          // Cannot be used to keep behaviour with previous stable consistent
          break;
        case 'repeat':
          triggerFlow('button_button_held');
          break;
        case 'short_release':
          triggerFlow('button_button_pressed');
          break;
        case 'long_release':
          triggerFlow('button_button_released');
          break;
        default:
          break;
      }
      this.buttonevent = buttonEvent;
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
