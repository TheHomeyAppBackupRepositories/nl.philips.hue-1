'use strict';

const HueBridge = require('./HueBridge');

module.exports = class HueBridgeCloud extends HueBridge {

  // https://api.meethue.com/bridge/<whitelist_identifier>/lights

  static POLL_INTERVAL = 1000 * 60 * 60; // Every 1 hour

  constructor({ oAuth2Client, ...props }) {
    const { username } = oAuth2Client.getToken();

    super({
      id: 'cloud',
      username,
      ...props,
    });

    this.oAuth2Client = oAuth2Client;
  }

  async init() {
    await this.getFullStateCached();
    await super.init();
  }

  /*
   * API
   */

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
    return this.oAuth2Client.put({
      path: `/route/clip/v2${path}`,
      headers: {
        'hue-application-key': this.username,
      },
    });
  }

};
