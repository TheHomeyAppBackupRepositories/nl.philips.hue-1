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

    const currentDeviceV2Ids = this.getDevices().map(device => device.getDeviceIdV2());

    const bridge = await this.homey.app.getBridgeAsync('cloud');
    const devices = await this.onPairGetDevices({ bridge });

    return Object.values(devices).map(device => {
      const obj = this.onPairListDevice({ device });
      if (obj === null) return null;

      return {
        ...obj,
        name: device.metadata.name,
        data: {
          id: device.id,
          bridge_id: bridge.id,
        },
        store: {
          converted_v2: true,
          deviceIdV2: device.id,
          servicesV2: device.services,
        },
        settings: {
          Model_ID: device.product_data.model_id,
        },
      };
    }).filter(device => {
      if (!device) {
        return false;
      }

      // We need to filter on existing v2 ids manually, as converted V1 devices are stored with a
      // different identifier causing Homey to not detect them as duplicates.
      return !currentDeviceV2Ids.includes(device.data.id);
    });
  }

  async onPairGetDevices({ bridge }) {
    throw new HueErrorOverloadMe();
  }

  onPairListDevice({ device }) {
    throw new HueErrorOverloadMe();
  }

};
