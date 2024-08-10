'use strict';

module.exports = class HueDeviceContactSensor {

  static HUE_DEVICE_TYPE = 'sensor';

  async onHueInit() {
    const id = this.getStoreValue('deviceIdV2');
    const services = this.getStoreValue('servicesV2');

    this.log(`Device: ${this.device.metadata.name}, Model: ${this.device.product_data.model_id}, UUID: ${id}`);

    for (const service of services) {
      if (service.rtype === 'contact') {
        this.contactSensorId = service.rid;
      } else if (service.rtype === 'tamper') {
        this.tamperSensorId = service.rid;
      } else if (service.rtype === 'device_power') {
        this.devicePowerId = service.rid;
      }
    }

    this.bridge.registerV2(id, this);
    this.bridge.registerV2(this.contactSensorId, this);
    this.bridge.registerV2(this.tamperSensorId, this);
    this.bridge.registerV2(this.devicePowerId, this);

    this.log('Contact sensor:', this.contactSensorId);
    this.log('Tamper sensor:', this.tamperSensorId);
    this.log('Device Power:', this.devicePowerId);

    // Get initial battery status
    const battery = await this.bridge.getBatteryMemoized({ id: this.devicePowerId });
    this.log('Battery Status:', battery?.power_state?.battery_level);

    await this.setCapabilityValue('measure_battery', battery?.power_state?.battery_level).catch(this.error);
  }

  async onHueDeleted() {
    this.bridge.unregisterV2(await this.getDeviceIdV2());
    this.bridge.unregisterV2(this.contactSensorId);
    this.bridge.unregisterV2(this.tamperSensorId);
    this.bridge.unregisterV2(this.devicePowerId);
  }

  async onHueEventUpdate(update) {
    this.log('Update:', update.type);
    if (update.type === 'device_power') {
      await this.setCapabilityValue('measure_battery', update.power_state.battery_level).catch(this.error);
    } else if (update.type === 'tamper') {
      await this.setCapabilityValue('alarm_tamper', update.tamper_reports[0].state !== 'not_tampered').catch(this.error);
    } else if (update.type === 'contact') {
      // Also turn off alarm if disabled
      await this.setCapabilityValue('alarm_contact', update.contact_report?.state === 'no_contact').catch(this.error);
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

  async enableContactSensor(value) {
    if (!this.bridge) return;

    this.log('Enable contact:', value);

    await this.bridge.setContactConfigV2({
      id: this.contactSensorId,
      config: {
        enabled: value,
      },
    });
  }

};
