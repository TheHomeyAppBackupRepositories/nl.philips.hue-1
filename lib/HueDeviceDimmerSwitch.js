'use strict';

module.exports = class HueDeviceDimmerSwitch {

  static HUE_DEVICE_TYPE = 'sensor';

  static BUTTON_EVENT_MAP = {
    1: 'on',
    2: 'increase_brightness',
    3: 'decrease_brightness',
    4: 'off',
  };

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
      } else if (service.rtype === 'device_power') {
        this.devicePowerId = service.rid;
      }
    }

    this.buttonMapping = buttonMapping;

    this.bridge.registerV2(id, this);
    for (const button of Object.keys(buttonMapping)) {
      this.bridge.registerV2(button, this);
    }
    this.bridge.registerV2(this.devicePowerId, this);

    this.log('Button Mapping:', this.buttonMapping);
    this.log('Device Power:', this.devicePowerId);

    // Get initial battery status
    const battery = await this.bridge.getBatteryMemoized({ id: this.devicePowerId });
    this.log('Battery Status:', battery?.power_state?.battery_level);

    await this.setCapabilityValue('measure_battery', battery?.power_state?.battery_level).catch(this.error);
  }

  async onHueDeleted() {
    this.bridge.unregisterV2(await this.getDeviceIdV2());
    for (const button of Object.keys(this.buttonMapping)) {
      this.bridge.unregisterV2(button);
    }
    this.bridge.unregisterV2(this.devicePowerId);
  }

  async onHueEventUpdate(update) {
    if (update.type === 'device_power') {
      await this.setCapabilityValue('measure_battery', update.power_state.battery_level).catch(this.error);
    } else if (update.type === 'button' && update.button?.last_event !== undefined) {
      const triggerFlow = (flowId, buttonArg) => {
        this.log('Trigger flow', flowId, buttonArg);
        this.homey.flow
          .getDeviceTriggerCard(flowId)
          .trigger(this, {}, { button: buttonArg })
          .catch(this.error);
      };

      const button = this.buttonMapping[update.id];
      const buttonEvent = update.button.last_event;
      const buttonArg = this.constructor.BUTTON_EVENT_MAP[button];

      this.log('Button update', button, buttonEvent);

      switch (buttonEvent) {
        case 'initial_press':
          triggerFlow(`${this.driver.id}_button_pressed`, buttonArg);
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
