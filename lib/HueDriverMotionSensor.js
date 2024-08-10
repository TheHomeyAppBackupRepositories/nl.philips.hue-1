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
        return device.enableMotionSensor(true);
      });

    this.homey.flow
      .getActionCard('disableMotionSensor')
      .registerRunListener(async ({ device }) => {
        return device.enableMotionSensor(false);
      });
  }

  async onPairGetDevices({ bridge }) {
    return bridge.getDevicesV2();
  }

  onPairListDevice({ device }) {
    this.log('Motion Sensor Device:', device.product_data.model_id, device.type, device.metadata.name);

    if (!['SML001', 'SML002', 'SML003', 'SML004'].includes(device.product_data.model_id)) return null;

    const obj = {};

    const icon = HueDriverMotionSensor.ICONS_MAP[device.product_data.model_id];
    if (icon) obj.icon = `/icons/${icon}.svg`;

    return obj;
  }

};
