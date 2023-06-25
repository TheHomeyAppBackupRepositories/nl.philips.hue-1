'use strict';

const HueError = require('./HueError');
const HueErrorOverloadMe = require('./HueErrorOverloadMe');

module.exports = class HueBridge {

  static POLL_INTERVAL = null;
  static HUE_DEVICE_TYPES = ['light', 'sensor'];

  constructor({ homey, id, username }) {
    this.homey = homey;
    this.id = id;
    this.username = username;

    this.registeredDevices = new Map();
    this.pollingInterval = this.homey.setInterval(() => this.poll(), this.constructor.POLL_INTERVAL);
  }

  destroy() {
    if (this.pollingInterval) {
      this.homey.clearInterval(this.pollingInterval);
    }
  }

  /*
   * API
   */

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
    this.registeredDevices.forEach(registeredDevice => {
      this.onRegisterDevice(registeredDevice);
    });
  }

  registerDevice(type, uniqueid, registeredDevice) {
    registeredDevice.type = type;
    registeredDevice.uniqueid = uniqueid;
    this.registeredDevices.set(`${type}-${uniqueid}`, registeredDevice);
    this.onRegisterDevice(registeredDevice);
  }

  unregisterDevice(type, uniqueid) {
    this.registeredDevices.delete(`${type}-${uniqueid}`);
  }

  onRegisterDevice(registeredDevice) {
    Promise.resolve().then(async () => {
      try {
        if (!this.username) {
          throw new new HueError('Please re-authenticate your Hue Bridge.')();
        }

        const state = await this.getFullStateCached();
        const {
          type,
          uniqueid,
          onDevice,
          onError,
          onPoll,
        } = registeredDevice;

        const devices = state[`${type}s`];
        const deviceId = Object.keys(devices).find(id => devices[id].uniqueid === uniqueid);
        const device = devices[deviceId];
        if (!device) {
          const error = new HueError('Device Not Found In Account');
          return onError({ error });
        }

        device.id = deviceId;

        if (onDevice && !registeredDevice.onDeviceFired) {
          registeredDevice.onDeviceFired = true;
          await onDevice({ device });
        }

        if (onPoll) {
          await onPoll({ device, state });
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

  /*
   * Polling
   */

  poll() {
    if (!this.username) return;

    Promise.resolve().then(async () => {
      const state = await this.getFullStateCached();
      for (const type of this.constructor.HUE_DEVICE_TYPES) {
        const hueDevices = state[`${type}s`];
        if (!hueDevices) continue;

        for (const [id, hueDevice] of Object.entries(hueDevices)) {
          const registeredDevice = this.registeredDevices.get(`${type}-${hueDevice.uniqueid}`);
          if (!registeredDevice) continue;

          if (typeof registeredDevice.onPoll === 'function') {
            Promise.resolve().then(async () => {
              await registeredDevice.onPoll({
                state,
                device: {
                  id,
                  ...hueDevice,
                },
              });
            }).catch(this.error);
          }
        }
      }
    }).catch(error => {
      this.homey.app.error('Poll Error:', error);

      this.registeredDevices.forEach(registeredDevice => {
        if (typeof registeredDevice.onError === 'function') {
          Promise.resolve().then(async () => {
            await registeredDevice.onError({
              error,
            });
          }).catch(this.error);
        }
      });
    });
  }

  /*
   * Lights
   */

  async getFullState() {
    return this.get({
      path: '/',
    });
  }

  async getFullStateCached() {
    if (this.stateCached) {
      const now = new Date();
      if (now.getTime() - this.stateCachedAt.getTime() < this.constructor.POLL_INTERVAL) {
        return this.stateCached;
      }
    }

    this.stateCachedAt = new Date();
    this.stateCached = this.getFullState();
    this.stateCached.catch(() => { });

    return this.stateCached;
  }

  /*
   * Lights
   */

  async getLights() {
    return this.get({
      path: '/lights',
    });
  }

  async getLightsV2() {
    return this.getV2({
      path: '/resource/light',
    });
  }

  async setLightName({ id, name }) {
    return this.put({
      path: `/lights/${id}`,
      json: { name },
    });
  }

  async setLightState({ id, state }) {
    return this.put({
      path: `/lights/${id}/state`,
      json: {
        ...state,
      },
    });
  }

  /*
   * Groups
   */

  async getGroups() {
    return this.get({
      path: '/groups',
    });
  }

  async setGroupState({ id, state }) {
    return this.put({
      path: `/groups/${id}/action`,
      json: {
        ...state,
      },
    });
  }

  /*
   * Scenes
   */

  async getScenes() {
    return this.get({
      path: '/scenes',
    });
  }

  async setScene({ id }) {
    return this.setGroupState({
      id: 0,
      state: {
        scene: id,
      },
    });
  }

  /*
   * Sensors
   */

  async getSensors() {
    return this.get({
      path: '/sensors',
    });
  }

  async setSensorConfig({ id, config }) {
    return this.put({
      path: `/sensors/${id}/config`,
      json: {
        ...config,
      },
    });
  }

  async setSensorName({ id, name }) {
    return this.put({
      path: `/sensors/${id}`,
      json: { name },
    });
  }

};
