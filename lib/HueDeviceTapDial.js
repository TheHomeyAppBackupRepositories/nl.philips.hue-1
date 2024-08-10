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
      } else if (service.rtype === 'relative_rotary') {
        this.rotaryId = service.rid;
      } else if (service.rtype === 'device_power') {
        this.devicePowerId = service.rid;
      }
    }

    this.buttonMapping = buttonMapping;

    this.bridge.registerV2(id, this);
    for (const button of Object.keys(buttonMapping)) {
      this.bridge.registerV2(button, this);
    }
    this.bridge.registerV2(this.rotaryId, this);
    this.bridge.registerV2(this.devicePowerId, this);

    this.log('Button Mapping:', this.buttonMapping);
    this.log('Rotary:', this.rotaryId);
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
    this.bridge.unregisterV2(this.rotaryId);
    this.bridge.unregisterV2(this.devicePowerId);
  }

  // Events are sent every second
  static rotationTimeout = 1100;

  // Cannot be placed in the store, as async writing would lead to race conditions
  totalRotation = 0
  debounceRotationTimeout
  resultDim = 0

  async onHueEventUpdate(update) {
    const triggerFlow = (flowId, tokens, state) => {
      this.log('Trigger flow', flowId, tokens, state);
      this.homey.flow
        .getDeviceTriggerCard(flowId)
        .trigger(this, tokens, state)
        .catch(this.error);
    };

    if (update.type === 'device_power' && update.power_state?.battery_level !== undefined) {
      await this.setCapabilityValue('measure_battery', update.power_state.battery_level).catch(this.error);
    } else if (update.type === 'relative_rotary' && update.relative_rotary?.last_event !== undefined) {
      const rotaryEvent = update.relative_rotary.last_event;
      const { steps, direction } = rotaryEvent.rotation;

      this.log('Rotary update', JSON.stringify(rotaryEvent));

      let newRotationStarted = false;

      // Aggregate rotation repeats for one start
      if (rotaryEvent.action === 'start') {
        // Reset the total rotation counter
        this.totalRotation = 0;

        // Initialize the dim value for this dial
        if (!this.resultDim) {
          this.resultDim = 0;
        }

        newRotationStarted = true;
      } else {
        // Prevent the old rotation timeout from running out
        clearTimeout(this.debounceRotationTimeout);
      }

      // Update dim value as soon as rotation events arrive
      const dim = Math.min(1, Math.max(0, this.resultDim + steps / (direction === 'clock_wise' ? 1000 : -1000)));
      this.resultDim = dim;

      // Set new timeout with new cumulative rotation
      const rotation = this.totalRotation + steps;
      this.totalRotation = rotation;

      this.debounceRotationTimeout = setTimeout(() => {
        triggerFlow('tapdial_dial_rotation_stopped', { steps: rotation }, { rotate_direction: direction });
      }, HueDeviceTapDial.rotationTimeout);

      if (newRotationStarted) {
        triggerFlow('tapdial_dial_rotation_started', {}, { rotate_direction: direction });
      }

      triggerFlow('tapdial_dial_rotation_dimmed', { dim_level: dim }, { });
    } else if (update.type === 'button' && update.button?.last_event !== undefined) {
      const button = this.buttonMapping[update.id];
      const buttonEvent = update.button.last_event;
      const buttonArg = this.constructor.BUTTON_EVENT_MAP[button];

      this.log('Button update', button, buttonEvent);

      switch (buttonEvent) {
        case 'initial_press':
          triggerFlow(`${this.driver.id}_button_pressed`, {}, { button: buttonArg });
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

  // The TapDial needs to be found by its ID - 1, contrary to other devices
  async convertDevice(V1ID) {
    const devices = await this.bridge.getDevicesV2();
    const device = devices.find(device => device.id_v1 === `/${this.constructor.HUE_DEVICE_TYPE}s/${V1ID - 1}`);
    if (!device) {
      throw new Error(`Cannot Find Device ${V1ID - 1} In Hue V2 API`);
    }

    this.device = device;

    const { id, services } = device;

    await this.setStoreValue('deviceIdV2', id);
    await this.setStoreValue('servicesV2', services);

    await this.setSettings({
      Model_ID: device.product_data.model_id,
    });

    return id;
  }

};
