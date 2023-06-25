'use strict';

const https = require('https');

const fetch = require('node-fetch');
const PromiseQueue = require('promise-queue');

const HueBridge = require('./HueBridge');
const HueError = require('./HueError');

module.exports = class HueBridgeLocal extends HueBridge {

  // http://<ip-address.of.the.bridge>/api/<whitelist_identifier>

  static POLL_INTERVAL = 2 * 1000;
  static API_TIMEOUT = 5 * 1000;
  static API_QUEUE_MAX = 100;
  static API_QUEUE_LENGTH = {
    BSB001: 1, // Hue Bridge (Gen. 1)
    BSB002: 3, // Hue Bridge (Gen. 2)
    DEFAULT: 3,
  };

  constructor({
    id,
    homey,
    address,
    ...props
  }) {
    const username = homey.settings.get(`bridge_token_${id}`);

    super({
      id,
      homey,
      username,
      ...props,
    });

    this.address = address;
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    this.pq = new PromiseQueue(HueBridgeLocal.API_QUEUE_LENGTH['DEFAULT'], HueBridgeLocal.API_QUEUE_MAX);
  }

  get icon() {
    if (this.modelid === 'BSB001') return 'icons/BSB001.svg';
    if (this.modelid === 'BSB002') return 'icons/BSB002.svg';
    return null;
  }

  async init() {
    const {
      name,
      modelid,
    } = await this.getConfig();

    this.name = name;
    this.modelid = modelid;

    const queueLength = HueBridgeLocal.API_QUEUE_LENGTH[this.model];
    if (typeof queueLength === 'number') {
      this.pq.maxPendingPromises = queueLength;
    }

    if (this.username) {
      await super.init();
    }
  }

  /*
   * API
   */

  async get({ path }) {
    if (!this.username) {
      throw new HueError('Not Authenticated');
    }

    return this.call({
      method: 'get',
      path: `/api/${this.username}${path}`,
    });
  }

  async post({ path, json }) {
    if (!this.username) {
      throw new HueError('Not Authenticated');
    }

    return this.call({
      method: 'post',
      path: `/api/${this.username}${path}`,
      json,
    });
  }

  async put({ path, json }) {
    if (!this.username) {
      throw new HueError('Not Authenticated');
    }

    return this.call({
      method: 'put',
      path: `/api/${this.username}${path}`,
      json,
    });
  }

  async delete({ path }) {
    if (!this.username) {
      throw new HueError('Not Authenticated');
    }

    return this.call({
      method: 'delete',
      path: `/api/${this.username}${path}`,
    });
  }

  async call({ method = 'get', path = '/', json }) {
    return this.pq.add(() => {
      return Promise.resolve().then(async () => {
        const res = await fetch(`http://${this.address}${path}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: json && JSON.stringify(json),
          timeout: this.constructor.API_TIMEOUT,
        });

        if (res.status === 204) {
          return undefined;
        }

        const body = await res.json();

        if (body.error) {
          throw new HueError(body.error.description, {
            type: body.error.type,
          });
        }

        if (Array.isArray(body) && body.length && body[0].error) {
          if (body[0].error.description === 'unauthorized user') {
            this.homey.settings.unset(`bridge_token_${this.id}`);
            throw new HueError('Please re-authenticate your Hue Bridge.');
          }

          throw new HueError(body[0].error.description, {
            type: body[0].error.type,
          });
        }

        return body;
      });
    });
  }

  async callV2({
    method = 'get',
    path = '/',
    json,
  }) {
    if (!this.username) {
      throw new HueError('Not Authenticated');
    }

    return this.pq.add(() => {
      return Promise.resolve().then(async () => {
        const res = await fetch(`https://${this.address}/clip/v2/${path}`, {
          method,
          agent: this.httpsAgent,
          headers: {
            'Content-Type': 'application/json',
            'hue-application-key': this.username,
          },
          body: json && JSON.stringify(json),
          timeout: this.constructor.API_TIMEOUT,
        }).catch(err => {
          console.error(err);
          throw err;
        });

        if (res.status === 204) {
          return undefined;
        }

        if (res.status === 403) {
          throw new HueError('Authentication Token Expired');
        }

        const body = await res.json();

        if (Array.isArray(body.errors) && body.errors.length > 0) {
          throw new HueError(body.errors[0].description || res.statusText);
        }

        if (Array.isArray(body.data)) {
          return body.data;
        }
      });
    });
  }

  async getV2({ path }) {
    return this.callV2({
      path,
      method: 'get',
    });
  }

  async putV2({ path, json }) {
    return this.callV2({
      path,
      json,
      method: 'put',
    });
  }

  async postV2({ path, json }) {
    return this.callV2({
      path,
      json,
      method: 'post',
    });
  }

  async deleteV2({ path, json }) {
    return this.deleteV2({
      path,
      method: 'delete',
    });
  }

  /*
   * Bridge Management
   */

  async createUser() {
    const [result] = await this.call({
      method: 'post',
      path: '/api',
      json: {
        devicetype: 'Homey',
      },
    });

    const { username } = result.success;

    this.username = username;
    this.homey.settings.set(`bridge_token_${this.id}`, this.username);

    await this.init();
  }

  async getConfig() {
    if (this.username) {
      return this.get({
        path: '/config',
      });
    }

    return this.call({
      method: 'get',
      path: '/api/config',
    });
  }

};
