'use strict';

const {
  OAuth2Client,
} = require('homey-oauth2app');

const HueError = require('./HueError');
const HueOAuth2Token = require('./HueOAuth2Token');

module.exports = class HueOAuth2Client extends OAuth2Client {

  static API_URL = 'https://api.meethue.com';
  static TOKEN_URL = 'https://api.meethue.com/v2/oauth2/token';
  static AUTHORIZATION_URL = 'https://api.meethue.com/v2/oauth2/authorize';
  static TOKEN = HueOAuth2Token;

  // onHandleAuthorizationURL() {
  //   const query = {
  //     clientid: this._clientId,
  //     appid: 'homey',
  //     deviceid: 'homey',
  //     devicename: 'Homey',
  //     response_type: 'code',
  //   };

  //   return `${this._authorizationUrl}?${querystring.stringify(query)}`;
  // }

  async onGetTokenByCode({ code }) {
    this.debug('onGetTokenByCode');

    const token = await super.onGetTokenByCode({ code });

    token.username = await this.createUser();

    // this._token = new this._tokenConstructor({
    //   access_token: json.access_token,
    //   refresh_token: json.refresh_token,
    //   expires_in: parseInt(json.access_token_expires_in, 10),
    //   username,
    // });

    return this.getToken();
  }

  // async onRefreshToken() {
  //   const token = this.getToken();
  //   if (!token) {
  //     throw new OAuth2Error('Missing Token');
  //   }

  //   this.debug('Refreshing token...');

  //   if (!token.isRefreshable()) {
  //     throw new OAuth2Error('Token cannot be refreshed');
  //   }
  //   const query = {
  //     grant_type: 'refresh_token',
  //   };

  //   const body = new URLSearchParams();
  //   body.append('refresh_token', token.refresh_token);

  //   const res = await fetch(`https://api.meethue.com/oauth2/refresh?${querystring.stringify(query)}`, {
  //     body,
  //     method: 'post',
  //     headers: {
  //       Authorization: `Basic ${Buffer.from(`${this._clientId}:${this._clientSecret}`).toString('base64')}`,
  //     },
  //   });

  //   const json = await res.json();

  //   if (!res.ok) {
  //     throw new Error((json && json.Error) || (json && json.fault && json.fault.faultstring) || res.statusText);
  //   }

  //   this._token = new this._tokenConstructor({
  //     access_token: json.access_token,
  //     refresh_token: json.refresh_token,
  //     expires_in: parseInt(json.access_token_expires_in, 10),
  //     username: token.username,
  //   });

  //   this.debug('Refreshed token!', this._token);
  //   this.save();

  //   return this.getToken();
  // }

  async onHandleResponse({
    response,
    status,
    ...props
  }) {
    const result = await super.onHandleResponse({
      response,
      status,
      ...props,
    });

    // CLIP V1
    if (Array.isArray(result) && result[0].error) {
      throw new HueError(result[0].error.Error || result[0].error.description || 'Unknown Error');
    }

    // CLIP V2
    if (result) {
      if (Array.isArray(result.errors) && result.errors.length > 0) {
        throw new HueError(result.errors[0].description || 'Unknown Error');
      }

      // CLIP V2
      if (Array.isArray(result.data)) {
        return result.data;
      }
    }

    // CLIP V1
    return result;
  }

  async onHandleNotOK({
    status,
    statusText,
    ...props
  }) {
    if (status === 504 && statusText === 'Gateway Timeout') {
      return new Error('Hue Bridge Offline. Is it connected to the internet?');
    }

    return super.onHandleNotOK({
      status,
      statusText,
      ...props,
    });
  }

  async createUser() {
    this.debug('createUser');

    await this.put({
      path: '/bridge/0/config',
      json: {
        linkbutton: true,
      },
    });

    const [result] = await this.post({
      path: '/bridge',
      json: {
        devicetype: 'Homey Cloud',
      },
    });

    return result.success.username;
  }

};
