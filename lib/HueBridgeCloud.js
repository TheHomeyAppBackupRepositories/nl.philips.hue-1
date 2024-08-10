'use strict';

const HueBridge = require('./HueBridge');

module.exports = class HueBridgeCloud extends HueBridge {

  // https://api.meethue.com/bridge/<whitelist_identifier>/lights

  static POLL_INTERVAL = 1000 * 60 * 60; // Every 1 hour

  constructor({ oAuth2Client, ...props }) {
    const token = oAuth2Client.getToken();
    let username;
    if (token) {
      username = token.username;
    }

    super({
      id: 'cloud',
      username,
      ...props,
    });

    this.oAuth2Client = oAuth2Client;

    this.pollingInterval = this.homey.setInterval(
      () => this.pollV2().catch(error => this.homey.app.error('Error occurred when polling: ', error)),
      this.constructor.POLL_INTERVAL,
    );
  }

  destroy() {
    if (this.pollingInterval) {
      this.homey.clearInterval(this.pollingInterval);
    }
  }

  async init() {
    await super.init();
  }

  /*
 * Polling
 */

  async pollV2() {
    // Only lights and plugs are available in the cloud
    const lights = await this.getLightsV2()
      .catch(error => {
        this.registeredDevicesV2.forEach(registeredDevice => {
          if (typeof registeredDevice.onError === 'function') {
            Promise.resolve().then(async () => {
              await registeredDevice.onError({
                error,
              });
            }).catch(this.error);
          }
        });
        throw error;
      });

    if (typeof lights === 'undefined') throw new Error('Property lights is undefined');

    lights.forEach(update => {
      const updateDevice = this.v2Devices.get(update.id);

      if (!updateDevice) {
        this.homey.app.log('No registered device found for', update.id);
        return;
      }

      updateDevice.onHueEventUpdate(update)
        .catch(err => this.homey.app.error('registeredDevice.onEventUpdate Error:', err));
    });
  }

  /*
   * API
   */

  async getV1Config() {
    return this.oAuth2Client.get({
      path: '/route/api/config',
    });
  }

  async get({ path = '/' }) {
    return this.oAuth2Client.get({
      path: `/route/api/${this.username}${path}`,
    });
  }

  async getV2({ path = '/' }) {
    return this.oAuth2Client.get({
      path: `/route/clip/v2${path}`,
      headers: {
        'hue-application-key': this.username,
      },
    });
  }

  async post({ path = '/', json }) {
    return this.oAuth2Client.post({
      json,
      path: `/route/api/${this.username}${path}`,
    });
  }

  async postV2({ path = '/', json }) {
    return this.oAuth2Client.post({
      json,
      path: `/route/clip/v2${path}`,
      headers: {
        'hue-application-key': this.username,
      },
    });
  }

  async put({ path = '/', json }) {
    return this.oAuth2Client.put({
      json,
      path: `/route/api/${this.username}${path}`,
    });
  }

  async putV2({ path = '/', json }) {
    return this.oAuth2Client.put({
      json,
      path: `/route/clip/v2${path}`,
      headers: {
        'hue-application-key': this.username,
      },
    });
  }

  async delete({ path = '/' }) {
    return this.oAuth2Client.delete({
      path: `/route/api/${this.username}${path}`,
    });
  }

  async deleteV2({ path = '/' }) {
    return this.oAuth2Client.delete({
      path: `/route/clip/v2${path}`,
      headers: {
        'hue-application-key': this.username,
      },
    });
  }

};
