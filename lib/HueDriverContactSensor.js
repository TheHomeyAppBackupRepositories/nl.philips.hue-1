'use strict';

module.exports = class HueDriverContactSensor {

  async onHueInit() {
    this.homey.flow
      .getActionCard('enableContactSensor')
      .registerRunListener(async ({ device }) => {
        return device.enableContactSensor(true);
      });

    this.homey.flow
      .getActionCard('disableContactSensor')
      .registerRunListener(async ({ device }) => {
        return device.enableContactSensor(false);
      });
  }

  async onPairGetDevices({ bridge }) {
    return bridge.getDevicesV2();
  }

  onPairListDevice({ device }) {
    this.log('Contact Sensor Device:', device.product_data.model_id, device.type, device.metadata.name);

    if (!['SOC001'].includes(device.product_data.model_id)) return null;

    return {};
  }

};
