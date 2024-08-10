'use strict';

module.exports = class HueDeviceModule {

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

    await this.syncModeCapabilities(this.device.device_mode?.mode).catch(this.error);

    // Get initial battery status
    const battery = await this.bridge.getBatteryMemoized({ id: this.devicePowerId });
    this.log('Battery Status:', battery?.power_state?.battery_level);

    await this.setCapabilityValue('measure_battery', battery?.power_state?.battery_level).catch(this.error);
  }

  async syncModeCapabilities(mode) {
    this.log('Detected mode:', mode);

    // Remove old capabilities
    if (this.hasCapability('module-type-rocker')) {
      this.removeCapability('module-type-rocker').catch(this.error);
    }
    if (this.hasCapability('module-type-push')) {
      this.removeCapability('module-type-push').catch(this.error);
    }

    // Determine required capability
    switch (mode) {
      case 'switch_dual_rocker':
        this.moduleType = 'module-type-rocker-double';
        break;
      case 'switch_dual_pushbutton':
        this.moduleType = 'module-type-push-double';
        break;
      case 'switch_single_rocker':
        this.moduleType = 'module-type-rocker-single';
        break;
      case 'switch_single_pushbutton':
      default:
        this.moduleType = 'module-type-push-single';
    }

    // Set the correct capabilities
    [
      'module-type-push-single',
      'module-type-push-double',
      'module-type-rocker-single',
      'module-type-rocker-double',
    ].forEach(c => {
      if (c === this.moduleType) {
        if (this.hasCapability(c)) {
          return;
        }

        this.addCapability(c).catch(this.error);
      } else {
        if (!this.hasCapability(c)) {
          return;
        }

        this.removeCapability(c).catch(this.error);
      }
    });
  }

  async onHueDeleted() {
    this.bridge.unregisterV2(await this.getDeviceIdV2());
    for (const button of Object.keys(this.buttonMapping)) {
      this.bridge.unregisterV2(button);
    }
    this.bridge.unregisterV2(this.devicePowerId);
  }

  async onHueEventUpdate(update) {
    if (update.type === 'button' && update.button?.last_event !== undefined) {
      const button = this.buttonMapping[update.id];
      const buttonEvent = update.button.last_event;
      this.log('Button update', button, buttonEvent, update.id);

      if (buttonEvent !== 'initial_press') {
        return;
      }

      const triggerFlow = flowId => {
        this.log('Triggering flow', flowId);
        this.homey.flow
          .getDeviceTriggerCard(flowId)
          .trigger(this)
          .catch(this.error);
      };

      // eslint-disable-next-line default-case
      switch (this.moduleType) {
        case 'module-type-rocker-single':
          triggerFlow('module_rocker_one_toggled');
          break;
        case 'module-type-rocker-double':
          triggerFlow(button === 2 ? 'module_rocker_two_toggled' : 'module_rocker_one_toggled');
          break;
        case 'module-type-push-single':
          triggerFlow('module_push_one_pressed');
          break;
        case 'module-type-push-double':
          triggerFlow(button === 2 ? 'module_push_two_pressed' : 'module_push_one_pressed');
          break;
      }

      // Deprecated cards
      const isRocker = this.moduleType.startsWith('module-type-rocker');
      if (isRocker) {
        triggerFlow(`module_rocker_button_${(button === 2 ? 'two' : 'one')}_pressed`);
      } else if (button === 2) {
        this.push_two_on = !this.push_two_on;
        triggerFlow(`module_push_button_two_turned_${this.push_two_on ? 'on' : 'off'}`);
      } else {
        this.push_one_on = !this.push_one_on;
        triggerFlow(`module_push_button_one_turned_${this.push_one_on ? 'on' : 'off'}`);
      }
    } else if (update.type === 'device_power' && update.power_state?.battery_level !== undefined) {
      await this.setCapabilityValue('measure_battery', update.power_state.battery_level).catch(this.error);
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
