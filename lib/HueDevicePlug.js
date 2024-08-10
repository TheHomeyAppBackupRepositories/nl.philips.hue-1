'use strict';

module.exports = class HueDevicePlug {

  static HUE_DEVICE_TYPE = 'light';

  async onHueInit() {
    const id = this.getStoreValue('deviceIdV2');
    const services = this.getStoreValue('servicesV2');

    this.log(`Device: ${this.device.metadata.name}, Model: ${this.device.product_data.model_id}, UUID: ${id}`);

    for (const service of services) {
      if (service.rtype === 'light') {
        this.lightId = service.rid;
      }
    }

    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));

    this.bridge.registerV2(id, this);
    this.bridge.registerV2(this.lightId, this);

    this.log('Light:', this.lightId);
  }

  async onHueDeleted() {
    this.bridge.unregisterV2(await this.getDeviceIdV2());
    this.bridge.unregisterV2(this.lightId);
  }

  async onHueEventUpdate(update) {
    this.log('Update:', update.type);
    if (update.type === 'light' && update.on?.on !== undefined) {
      await this.setCapabilityValue('onoff', update.on.on).catch(this.error);
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

  async onCapabilityOnoff(value) {
    return this.bridge.setLightStateV2({
      state: {
        on: {
          on: !!value,
        },
      },
      id: this.lightId,
    });
  }

};
