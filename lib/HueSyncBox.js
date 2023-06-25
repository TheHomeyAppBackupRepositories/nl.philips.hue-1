'use strict';

const https = require('https');
const fetch = require('node-fetch');

const HueError = require('./HueError');

module.exports = class HueSyncBox {

  static API_TIMEOUT = 5 * 1000;

  constructor({ address }) {
    this.address = address;
    this.agent = new https.Agent({
      rejectUnauthorized: false,
    });
  }

  setToken({ token }) {
    this.token = token;
  }

  async call({
    method = 'get', path, json, headers = {}, token = this.token,
  }) {
    if (typeof token === 'string') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`https://${this.address}/api/v1${path}`, {
      method,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
      agent: this.agent,
      timeout: HueSyncBox.API_TIMEOUT,
    });

    if (res.status === 204) {
      return undefined;
    }

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new HueError(body.message || res.statusText);
    }

    return body;
  }

  async get({ path, ...args }) {
    return this.call({ method: 'get', path, ...args });
  }

  async put({ path, json, ...args }) {
    return this.call({
      method: 'put', path, json, ...args,
    });
  }

  async post({ path, json, ...args }) {
    return this.call({
      method: 'post', path, json, ...args,
    });
  }

  async delete({ path, ...args }) {
    return this.call({ method: 'delete', path, ...args });
  }

  async createRegistration({ appName = 'Homey', instanceName = 'nl.philips.hue' } = {}) {
    const { accessToken } = await this.post({
      path: '/registrations',
      json: {
        appName,
        instanceName,
      },
    });
    return accessToken;
  }

  async getHue() {
    return this.get({
      path: '/hue',
    });
  }

  async getDevice() {
    return this.get({
      path: '/device',
    });
  }

  async getExecution() {
    return this.get({
      path: '/execution',
    });
  }

  async setExecution(props) {
    return this.put({
      path: '/execution',
      json: {
        ...props,
      },
    });
  }

  async setInput({ input = 'input1' }) {
    return this.setExecution({
      hdmiSource: input,
    });
  }

  async setHDMIActive({ active = true }) {
    return this.setExecution({
      hdmiActive: active,
    });
  }

  async setBrightness({ brightness = 200 }) {
    return this.setExecution({
      brightness,
    });
  }

  async setSyncActive({ active = true }) {
    return this.setExecution({
      syncActive: active,
    });
  }

  async getHDMI() {
    return this.get({
      path: '/hdmi',
    });
  }

};
