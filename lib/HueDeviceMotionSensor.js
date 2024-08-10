'use strict';

module.exports = class HueDeviceMotionSensor {

  static HUE_DEVICE_TYPE = 'sensor';

  async onHueInit() {
    const id = this.getStoreValue('deviceIdV2');
    const services = this.getStoreValue('servicesV2');

    this.log(`Device: ${this.device.metadata.name}, Model: ${this.device.product_data.model_id}, UUID: ${id}`);

    for (const service of services) {
      if (service.rtype === 'motion') {
        this.motionSensorId = service.rid;
      } else if (service.rtype === 'light_level') {
        this.lightLevelSensorId = service.rid;
      } else if (service.rtype === 'temperature') {
        this.temperatureSensorId = service.rid;
      } else if (service.rtype === 'device_power') {
        this.devicePowerId = service.rid;
      }
    }

    this.bridge.registerV2(id, this);
    this.bridge.registerV2(this.motionSensorId, this);
    this.bridge.registerV2(this.temperatureSensorId, this);
    this.bridge.registerV2(this.lightLevelSensorId, this);
    this.bridge.registerV2(this.devicePowerId, this);

    this.log('Motion sensor:', this.motionSensorId);
    this.log('Temp sensor:', this.temperatureSensorId);
    this.log('Light sensor:', this.lightLevelSensorId);
    this.log('Device Power:', this.devicePowerId);

    // Get initial battery status
    const battery = await this.bridge.getBatteryMemoized({ id: this.devicePowerId });
    this.log('Battery Status:', battery?.power_state?.battery_level);

    await this.setCapabilityValue('measure_battery', battery?.power_state?.battery_level).catch(this.error);
  }

  async onHueDeleted() {
    this.bridge.unregisterV2(await this.getDeviceIdV2());
    this.bridge.unregisterV2(this.motionSensorId);
    this.bridge.unregisterV2(this.temperatureSensorId);
    this.bridge.unregisterV2(this.lightLevelSensorId);
    this.bridge.unregisterV2(this.devicePowerId);
  }

  async onHueEventUpdate(update) {
    this.log('Update:', update.type);
    if (update.type === 'device_power') {
      await this.setCapabilityValue('measure_battery', update.power_state.battery_level).catch(this.error);
    } else if (update.type === 'motion') {
      const motion = update.motion === undefined ? null : update.motion.motion;
      await this.setCapabilityValue('alarm_motion', motion).catch(this.error);
    } else if (update.type === 'light_level') {
      const lightLevel = update.light === undefined ? null : 10 ** ((update.light.light_level - 1) / 10000);
      await this.setCapabilityValue('measure_luminance', lightLevel).catch(this.error);
    } else if (update.type === 'temperature') {
      const temperature = update.temperature === undefined ? null : update.temperature.temperature;
      await this.setCapabilityValue('measure_temperature', temperature).catch(this.error);
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

  async enableMotionSensor(value) {
    if (!this.bridge) return;

    this.log('Enable motion:', value);

    await this.bridge.setMotionConfigV2({
      id: this.motionSensorId,
      config: {
        enabled: value,
      },
    });
  }

  static getMAC(str) {
    return str.split('-')[0].toLowerCase();
  }

};
