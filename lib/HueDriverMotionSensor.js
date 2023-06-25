'use strict';

module.exports = class HueDriverMotionSensor {

  static ICONS_MAP = {
    SML001: 'SML001',
    SML002: 'SML002',
    SML003: 'SML001',
    SML004: 'SML002',
  }

  async onHueInit() {
    this.homey.flow
      .getActionCard('enableMotionSensor')
      .registerRunListener(async ({ device }) => {
        return device.enableMotionSensor();
      });

    this.homey.flow
      .getActionCard('disableMotionSensor')
      .registerRunListener(async ({ device }) => {
        return device.disableMotionSensor();
      });
  }

  async onPairGetDevices({ bridge }) {
    return bridge.getSensors();
  }

  onPairListDevice({ device }) {
    this.log('Motion Sensor Device:', device.modelid, device.type, device.name);

    if (!['SML001', 'SML002', 'SML003', 'SML004'].includes(device.modelid)) return null;
    if (device.type !== 'ZLLPresence') return null;

    const obj = {};

    const icon = HueDriverMotionSensor.ICONS_MAP[device.modelid];
    if (icon) obj.icon = `/icons/${icon}.svg`;

    return obj;
  }

};
