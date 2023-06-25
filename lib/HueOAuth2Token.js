'use strict';

const { OAuth2Token } = require('homey-oauth2app');

module.exports = class HueOAuth2Token extends OAuth2Token {

  constructor({ username, ...props }) {
    super({ ...props });

    this.username = username;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      username: this.username,
    };
  }

};
