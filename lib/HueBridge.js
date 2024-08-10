'use strict';

const HueError = require('./HueError');
const HueErrorOverloadMe = require('./HueErrorOverloadMe');

module.exports = class HueBridge {

  constructor({ homey, id, username }) {
    this.homey = homey;
    this.id = id;
    this.username = username;

    // Used for initialization and polling
    this.registeredDevicesV2 = new Map();

    // For now only used for event mapping
    this.v2Devices = new Map();
  }

  /*
   * API
   */

  async getV1Config() {
    throw new HueErrorOverloadMe();
  }

  async get() {
    throw new HueErrorOverloadMe();
  }

  async post() {
    throw new HueErrorOverloadMe();
  }

  async put() {
    throw new HueErrorOverloadMe();
  }

  async delete() {
    throw new HueErrorOverloadMe();
  }

  async getV2({ path }) {
    throw new HueErrorOverloadMe();
  }

  async postV2({ path, json }) {
    throw new HueErrorOverloadMe();
  }

  async putV2({ path, json }) {
    throw new HueErrorOverloadMe();
  }

  async deleteV2({ path }) {
    throw new HueErrorOverloadMe();
  }

  /*
   * Bridge Management
   */

  async createUser() {
    throw new HueErrorOverloadMe();
  }

  async getConfig() {
    return this.get({
      path: '/config',
    });
  }

  /*
   * Device Management
   */

  async init() {
    // Check whether this bridge is running outdated firmware
    const apiV1Config = await this.getV1Config();
    // console.log('V1 Config:', apiV1Config);

    const softwareVersion = parseInt(apiV1Config.swversion, 10);

    if (softwareVersion < 1948086000) {
      throw new HueError(`The bridge with ID ${apiV1Config.bridgeid} needs a software update before it can be used.`);
    }

    this.registeredDevicesV2.forEach(registeredDevice => {
      this.onRegisterDeviceV2(registeredDevice);
    });
  }

  registerDeviceV2(uuid, registeredDevice) {
    this.registeredDevicesV2.set(uuid, registeredDevice);
    this.onRegisterDeviceV2(registeredDevice);
  }

  unregisterDeviceV2(uuid) {
    this.registeredDevicesV2.delete(uuid);
  }

  onRegisterDeviceV2(registeredDevice) {
    Promise.resolve().then(async () => {
      try {
        if (!this.username) {
          throw new new HueError('Please re-authenticate your Hue Bridge.')();
        }

        const {
          onDevice,
        } = registeredDevice;

        if (onDevice && !registeredDevice.onDeviceFired) {
          registeredDevice.onDeviceFired = true;
          await onDevice();
        }
      } catch (error) {
        const {
          onError,
        } = registeredDevice;

        if (onError) {
          await onError({ error });
        }
      }
    }).catch(this.homey.app.error);
  }

  registerV2(uuid, device) {
    this.v2Devices.set(uuid, device);
  }

  unregisterV2(uuid) {
    this.v2Devices.delete(uuid);
  }

  /*
   * Lights
   */

  async getFullState() {
    return this.get({
      path: '/',
    });
  }

  async getV1StateMemoized() {
    if (!this.stateCached) {
      console.log('Polling v1 state...');
      this.stateCached = this.getFullState();
    }

    return this.stateCached;
  }

  /*
   * Lights
   */

  async getLightV2({ id }) {
    const response = await this.getV2({
      path: `/resource/light/${id}`,
    });
    return response[0];
  }

  async getLightsV2() {
    return this.getV2({
      path: '/resource/light',
    });
  }

  async getDeviceV2({ id }) {
    const response = await this.getV2({
      path: `/resource/device/${id}`,
    });
    return response[0];
  }

  async getDevicesV2() {
    return this.getV2({
      path: '/resource/device',
    });
  }

  async setDeviceNameV2({ id, name }) {
    return this.putV2({
      path: `/resource/device/${id}`,
      json: {
        metadata: {
          name,
        },
      },
    });
  }

  // @deprecated used in legacy flows
  async setLightState({ id, state }) {
    return this.put({
      path: `/lights/${id}/state`,
      json: {
        ...state,
      },
    });
  }

  async setLightStateV2({ id, state }) {
    return this.putV2({
      path: `/resource/light/${id}`,
      json: {
        ...state,
      },
    });
  }

  /*
   * Battery Status
   */

  async getBatteryV2({ id }) {
    const response = await this.getV2({
      path: `/resource/device_power/${id}`,
    });
    return response[0];
  }

  async getBatteriesV2() {
    return this.getV2({
      path: '/resource/device_power',
    });
  }

  cacheBatteries() {
    console.log('Polling batteries...');
    this.batteriesCached = this.getBatteriesV2();
  }

  async getCachedBatteries() {
    return this.batteriesCached;
  }

  async getBatteriesMemoized() {
    if (!await this.getCachedBatteries()) {
      await this.cacheBatteries();
    }
    return this.batteriesCached;
  }

  async getBatteryMemoized({ id }) {
    // First initialization
    if (!await this.getCachedBatteries()) {
      this.cacheBatteries();
    } else {
      // Poll again if the current battery is not known
      const batteries = await this.getCachedBatteries();
      const devicePowerIds = batteries.map(devicePower => devicePower.id);
      if (!devicePowerIds.includes(id)) {
        await this.cacheBatteries();
      }
    }
    // Return the requested battery
    const batteries = await this.getCachedBatteries();
    for (const devicePower of batteries) {
      if (devicePower.id === id) {
        return devicePower;
      }
    }
    // Or null if it does not exist
    return null;
  }

  /*
   * Groups
   */

  async getRoomsV2() {
    return this.getV2({
      path: '/resource/room',
    });
  }

  async getZonesV2() {
    return this.getV2({
      path: '/resource/zone',
    });
  }

  async getHomesV2() {
    return this.getV2({
      path: '/resource/bridge_home',
    });
  }

  async getGroupsV2() {
    return this.getV2({
      path: '/resource/grouped_light',
    });
  }

  async setGroupStateV2({ id, state }) {
    return this.putV2({
      path: `/resource/grouped_light/${id}`,
      json: {
        ...state,
      },
    });
  }

  /*
   * Scenes
   */

  async getScenesV2() {
    return this.getV2({
      path: '/resource/scene',
    });
  }

  async setSceneV2({ id }) {
    return this.putV2({
      path: `/resource/scene/${id}`,
      json: { recall: { action: 'active' } },
    });
  }

  /*
   * Sensors
   */

  async setMotionConfigV2({ id, config }) {
    return this.putV2({
      path: `/resource/motion/${id}`,
      json: {
        ...config,
      },
    });
  }

  async setContactConfigV2({ id, config }) {
    return this.putV2({
      path: `/resource/contact/${id}`,
      json: {
        ...config,
      },
    });
  }

};
