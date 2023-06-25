'use strict';

const { OAuth2Driver } = require('homey-oauth2app');
const HueErrorOverloadMe = require('./HueErrorOverloadMe');
const HueUtil = require('./HueUtil');

module.exports = class HueDriverCloud extends OAuth2Driver {

  async onOAuth2Init() {
    await this.onHueInit();
  }

  async onHueInit() {
    // Overload Me
  }

  async onPairListDevices({ oAuth2Client }) {
    await oAuth2Client.save();
    await HueUtil.nextTick();

    const bridge = await this.homey.app.getBridgeAsync('cloud');
    const devices = await this.onPairGetDevices({ bridge });

    return Object.values(devices).map(device => {
      const obj = this.onPairListDevice({ device });
      if (obj === null) return null;

      return {
        ...obj,
        name: device.name,
        data: {
          id: device.uniqueid,
          bridge_id: bridge.id,
        },
      };
    }).filter(device => !!device);
  }

  async onPairGetDevices({ bridge }) {
    throw new HueErrorOverloadMe();
  }

  onPairListDevice({ device }) {
    throw new HueErrorOverloadMe();
  }

};
