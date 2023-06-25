'use strict';

module.exports = class HueDeviceMotionSensor {

  static HUE_DEVICE_TYPE = 'sensor';

  async onHueInit() {
    this.log(`Device: ${this.device.name}, Model: ${this.device.modelid}`);
  }

  async onHuePoll({ state }) {
    if (!this.device.state) return;
    if (!this.device.config) return;

    this.setCapabilityValue('measure_battery', parseInt(this.device.config.battery, 10)).catch(this.error);
    this.setCapabilityValue('alarm_motion', this.device.state.presence).catch(this.error);

    // Find subdevices
    Object.values(state.sensors).filter(sensor => {
      if (!['SML001', 'SML002', 'SML003', 'SML004'].includes(sensor.modelid)) {
        return false;
      }

      if (HueDeviceMotionSensor.getMAC(sensor.uniqueid) !== HueDeviceMotionSensor.getMAC(this.device.uniqueid)) {
        return false;
      }

      if (!sensor.state) {
        return false;
      }

      return true;
    }).forEach(sensor => {
      if (sensor.type === 'ZLLLightLevel') {
        if (typeof sensor.state.lightlevel !== 'number') {
          this.setCapabilityValue('measure_luminance', null).catch(this.error);
          return;
        }

        // eslint-disable-next-line no-restricted-properties
        const lightlevel = Math.pow(10, (sensor.state.lightlevel - 1) / 10000);
        this.setCapabilityValue('measure_luminance', lightlevel).catch(this.error);
        return;
      }

      if (sensor.type === 'ZLLTemperature') {
        if (typeof sensor.state.temperature !== 'number') {
          this.setCapabilityValue('measure_temperature', null).catch(this.error);
          return;
        }

        const temperature = parseFloat(sensor.state.temperature) / 100;
        this.setCapabilityValue('measure_temperature', temperature).catch(this.error);
      }
    });
  }

  async onRenamed(name) {
    if (!this.bridge) return;

    await this.bridge.setSensorName({
      name,
      id: this.device.id,
    });
  }

  async enableMotionSensor() {
    if (!this.bridge) return;

    await this.bridge.setSensorConfig({
      id: this.device.id,
      config: {
        on: true,
      },
    });
  }

  async disableMotionSensor() {
    if (!this.bridge) return;

    await this.bridge.setSensorConfig({
      id: this.device.id,
      config: {
        on: false,
      },
    });
  }

  static getMAC(str) {
    return str.split('-')[0].toLowerCase();
  }

};
