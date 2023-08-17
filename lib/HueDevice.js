'use strict';

const Homey = require('homey');

module.exports = class HueDevice extends Homey.Device {

  async onInit() {
    await this.setUnavailable(this.homey.__('loading'));

    const data = this.getData();

    this.bridge = await this.homey.app.getBridgeAsync(data.bridge_id);
    this.bridge.registerDevice(this.constructor.HUE_DEVICE_TYPE, data.id, {
      onDevice: async ({ device }) => {
        this.device = device;
        await this.setSettings({
          Model_ID: this.device.modelid,
        });
        await this.onHueInit();
        await this.setAvailable();
      },
      onPoll: async ({ device, state }) => {
        this.device = device;
        await this.onHuePoll({ state });
        await this.setAvailable();
        this.errorCount = 0;
      },
      onError: async ({ error }) => {
        this.errorCount = this.errorCount || 0;
        this.errorCount++;
        if (this.errorCount > 3) {
          await this.setUnavailable(error);
        }
      },
    });
  }

  async onUninit() {
    if (this.bridge) {
      const data = this.getData();
      this.bridge.unregisterDevice(this.constructor.HUE_DEVICE_TYPE, data.id);
      this.bridge = null;
    }
  }

  async onDeleted() {
    if (this.bridge) {
      const data = this.getData();
      this.bridge.unregisterDevice(this.constructor.HUE_DEVICE_TYPE, data.id);
    }

    await this.onHueDeleted();
  }

  async onHueInit() {
    // Overload Me
  }

  async onHuePoll() {
    // Overload Me
  }

  async onHueDeleted() {
    // Overload Me
  }

  async getDeviceIdV2() {
    if (this.getStoreValue('deviceIdV2')) {
      return this.getStoreValue('deviceIdV2');
    }

    const devices = await this.bridge.getLightsV2();
    const device = devices.find(device => device.id_v1 === `/${this.constructor.HUE_DEVICE_TYPE}s/${this.device.id}`);
    if (!device) {
      throw new Error(`Cannot Find Device ${this.device.id} In Hue V2 API`);
    }
    const deviceId = device.id;
    await this.setStoreValue('deviceIdV2', deviceId);

    return deviceId;
  }

};
