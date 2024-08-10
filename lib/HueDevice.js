'use strict';

const Homey = require('homey');
const RateLimitError = require('./RateLimitError');
const { FetchError } = require('node-fetch');

module.exports = class HueDevice extends Homey.Device {

  async onInit() {
    await this.setUnavailable(this.homey.__('loading'));

    const data = this.getData();

    if (this.getStore() === null) {
      for (const key of Object.getOwnPropertySymbols(this)) {
        if (String(key) === 'Symbol(store)' && this[key] == null) {
          this[key] = {};
        }
      }
    }
    this.bridge = await this.homey.app.getBridgeAsync(data.bridge_id);
    let V2ID = this.getStoreValue('deviceIdV2');
    const convertedV2 = this.getStoreValue('converted_v2');

    try {
      if (!convertedV2) {
        const state = await this.bridge.getV1StateMemoized();

        const v1Devices = state[`${this.constructor.HUE_DEVICE_TYPE}s`];
        const v1DeviceId = Object.keys(v1Devices).find(id => v1Devices[id].uniqueid === data.id);

        if (v1DeviceId) {
          V2ID = await this.convertDevice(v1DeviceId);
        } else if (V2ID) {
          await this.setStoreValue('converted_v2', true);
        } else {
          throw new Error(`Cannot find device ${data.id} in either V1 or V2 API`);
        }
      }

      // Get device from API if not already stored
      if (!this.device) {
        this.device = await this.bridge.getDeviceV2({ id: V2ID });
      }
    } catch (error) {
      this.onError(error);
    }

    this.bridge.registerDeviceV2(V2ID, {
      onDevice: async () => {
        await this.onHueInit();
        await this.setAvailable();
      },
      onPoll: async ({ state }) => {
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

        if (error instanceof RateLimitError || error instanceof FetchError) {
          this.onError(error);
        }
      },
      onEventUpdate: this.onHueEventUpdate,
    });
  }

  async onUninit() {
    if (this.bridge) {
      const V2ID = this.getDeviceIdV2();
      this.bridge.unregisterV2(V2ID);
      this.bridge = null;
    }
  }

  async onDeleted() {
    if (this.bridge) {
      const V2ID = this.getDeviceIdV2();
      this.bridge.unregisterDeviceV2(V2ID);
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

  async onHueEventUpdate() {
    // Overload Me
  }

  onError(err) {
    if (!(err instanceof RateLimitError) && !(err instanceof FetchError)) throw err;
    this.retryCount = this.retryCount || 0;

    if (this.retryCount >= 3) {
      this.setUnavailable(this.homey.__('rate_limit_error')).catch(this.error);
      return;
    }

    this.retryCount++;
    this.setUnavailable(this.homey.__('rate_limit_retry')).catch(this.error);

    this.homey.setTimeout(() => {
      this.onInit().catch(this.error);
    }, Math.random() * 20000 + 10000 * (this.retryCount ^ 2));
  }

  async convertDevice(V1ID) {
    const devices = await this.bridge.getDevicesV2();
    const device = devices.find(device => device.id_v1 === `/${this.constructor.HUE_DEVICE_TYPE}s/${V1ID}`);
    if (!device) {
      throw new Error(`Cannot Find Device ${V1ID} In Hue V2 API`);
    }

    this.device = device;

    const { id, services } = device;

    await this.setStoreValue('converted_v2', true);
    await this.setStoreValue('deviceIdV2', id);
    await this.setStoreValue('servicesV2', services);

    await this.setSettings({
      Model_ID: device.product_data.model_id,
    });

    return id;
  }

  getDeviceIdV2() {
    return this.getStoreValue('deviceIdV2');
  }

};
