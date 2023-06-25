'use strict';

const HueUtil = require('./HueUtil');

module.exports = class HueDeviceBulb {

  static HUE_DEVICE_TYPE = 'light';
  static CAPABILITIES_MAP = {
    onoff: 'on',
    dim: 'bri',
    light_hue: 'hue',
    light_saturation: 'sat',
    light_temperature: 'ct',
    light_mode: 'colormode',
  };

  static ENERGY_MAP = {
    LCT001: { approximation: { usageOff: 0.5, usageOn: 8.5 } },
    LCT002: { approximation: { usageOff: 0.5, usageOn: 8.0 } },
    LCT003: { approximation: { usageOff: 0.5, usageOn: 6.5 } },
    LCT007: { approximation: { usageOff: 0.5, usageOn: 9.0 } },
    LCT010: { approximation: { usageOff: 0.5, usageOn: 10.0 } },
    LCT011: { approximation: { usageOff: 0.5, usageOn: 9.0 } },
    LCT012: { approximation: { usageOff: 0.5, usageOn: 6.5 } },
    LCT015: { approximation: { usageOff: 0.5, usageOn: 9.5 } },
    LTW001: { approximation: { usageOff: 0.5, usageOn: 9.5 } },
    LTW004: { approximation: { usageOff: 0.5, usageOn: 9.5 } },
    LTW010: { approximation: { usageOff: 0.5, usageOn: 9.5 } },
    LTW011: { approximation: { usageOff: 0.5, usageOn: 9.5 } },
    LTW012: { approximation: { usageOff: 0.5, usageOn: 9.5 } },
    LTW013: { approximation: { usageOff: 0.5, usageOn: 9.5 } },
    LTW015: { approximation: { usageOff: 0.5, usageOn: 9.5 } },
    LWB004: { approximation: { usageOff: 0.5, usageOn: 9.0 } },
    LWB007: { approximation: { usageOff: 0.5, usageOn: 9.0 } },
    LWB006: { approximation: { usageOff: 0.5, usageOn: 9.5 } },
    LWB010: { approximation: { usageOff: 0.5, usageOn: 9.5 } },
    LWB014: { approximation: { usageOff: 0.5, usageOn: 9.5 } },
    LST001: { approximation: { usageOff: 0.5, usageOn: 20.0 } },
    LST002: { approximation: { usageOff: 0.5, usageOn: 20.0 } },
    LST003: { approximation: { usageOff: 0.5, usageOn: 37.5 } },
    LLC010: { approximation: { usageOff: 0.5, usageOn: 7.5 } },
    LLC011: { approximation: { usageOff: 0.5, usageOn: 7.5 } },
    LLC012: { approximation: { usageOff: 0.5, usageOn: 7.5 } },
  };

  async onHueInit() {
    const capabilities = this.getCapabilities();
    this.registerMultipleCapabilityListener(capabilities, this.onCapabilityAll.bind(this), 200);

    const deviceEnergy = this.getEnergy();
    const driverEnergy = HueDeviceBulb.ENERGY_MAP[this.device.modelid] || null;

    if (JSON.stringify(deviceEnergy) !== JSON.stringify(driverEnergy)) {
      this.log('Energy out of sync, updating...');
      this.setEnergy(driverEnergy).catch(this.error);
    }

    this.log(`Device: ${this.device.name}, Model: ${this.device.modelid}`);
  }

  async onHuePoll() {
    if (!this.device.state) return;

    if (this.device.productname.includes('gradient')) {
      await this.addCapability('light-gradient');
    }

    for (const capabilityId of Object.keys(HueDeviceBulb.CAPABILITIES_MAP)) {
      if (!this.hasCapability(capabilityId)) continue;

      const propertyId = HueDeviceBulb.CAPABILITIES_MAP[capabilityId];
      const propertyValue = this.device.state[propertyId];
      const convertedValue = HueDeviceBulb.convert(capabilityId, 'get', propertyValue);

      if (this.getCapabilityValue('onoff') === false && capabilityId === 'dim') continue;
      this.setCapabilityValue(capabilityId, convertedValue).catch(this.error);
    }
  }

  async onRenamed(name) {
    if (!this.bridge) return;

    await this.bridge.setLightName({
      name,
      id: this.device.id,
    });
  }

  async onCapabilityAll(valueObj, optionsObj) {
    let setCapabilityOnoff = null;
    const state = {
      effect: 'none',
      alert: 'none',
    };

    if (typeof valueObj['onoff'] !== 'undefined') {
      state.on = valueObj['onoff'];
    }

    if (typeof valueObj['dim'] !== 'undefined') {
      state.bri = HueDeviceBulb.convert('dim', 'set', valueObj['dim']);

      if (valueObj['dim'] === 0) {
        state.on = false;
        setCapabilityOnoff = false;
      } else if (valueObj['dim'] > 0) {
        state.on = true;
        setCapabilityOnoff = true;
      }
    }

    if (typeof valueObj['light_temperature'] !== 'undefined') {
      state.ct = HueDeviceBulb.convert('light_temperature', 'set', valueObj['light_temperature']);
      state.on = true;
    } else {
      if (typeof valueObj['light_hue'] !== 'undefined') {
        state.hue = HueDeviceBulb.convert('light_hue', 'set', valueObj['light_hue']);
        state.on = true;
      }

      if (typeof valueObj['light_saturation'] !== 'undefined') {
        state.sat = HueDeviceBulb.convert('light_saturation', 'set', valueObj['light_saturation']);
        state.on = true;
      }
    }

    // Add transition
    for (const { duration } of Object.values(optionsObj)) {
      if (typeof duration === 'number') {
        state.transitiontime = duration / 100;
      }
    }

    // this.log('New State:', state);

    if (Object.keys(state).length) {
      await this.setLightState(state);
    }

    if (typeof setCapabilityOnoff === 'boolean') {
      // this.log(`Setting onoff to ${setCapabilityOnoff}...`);
      await this.setCapabilityValue('onoff', setCapabilityOnoff).catch(this.error);
    }
  }

  async setLightState(state) {
    return this.bridge.setLightState({
      state,
      id: this.device.id,
    });
  }

  async shortAlert() {
    return this.setLightState({
      alert: 'select',
    });
  }

  async longAlert() {
    return this.setLightState({
      alert: 'lselect',
    });
  }

  async startColorLoop() {
    await this.setLightState({
      on: true,
      effect: 'colorloop',
      alert: 'none',
    });
    await this.setCapabilityValue('onoff', true).catch(this.error);
  }

  async stopColorLoop() {
    return this.setLightState({
      effect: 'none',
      alert: 'none',
    });
  }

  async setGradient({
    color1,
    color2,
    color3,
  }) {
    const deviceId = await this.getDeviceIdV2();

    await this.bridge.putV2({
      path: `/resource/light/${deviceId}`,
      json: {
        on: {
          on: true,
        },
        gradient: {
          points: [
            HueUtil.hexToXyColor(color1),
            HueUtil.hexToXyColor(color2),
            HueUtil.hexToXyColor(color3),
          ],
        },
      },
    });
    await this.setCapabilityValue('onoff', true);
  }

  static convert(capabilityId, direction, value) {
    if (capabilityId === 'onoff') {
      if (direction === 'get') {
        return value === true;
      } if (direction === 'set') {
        return value === true;
      }
    } else if (capabilityId === 'dim' || capabilityId === 'light_saturation') {
      if (direction === 'get') {
        value = Math.max(0, value);
        value = Math.min(254, value);
        return value / 254;
      } if (direction === 'set') {
        return Math.ceil(value * 254);
      }
    } else if (capabilityId === 'light_hue') {
      if (direction === 'get') {
        value = Math.max(0, value);
        value = Math.min(65535, value);
        return value / 65535;
      } if (direction === 'set') {
        return Math.ceil(value * 65535);
      }
    } else if (capabilityId === 'light_temperature') {
      if (direction === 'get') {
        value = Math.max(153, value);
        value = Math.min(500, value);
        return (value - 153) / (500 - 153);
      } if (direction === 'set') {
        return Math.ceil(153 + value * (500 - 153));
      }
    } else if (capabilityId === 'light_mode') {
      if (direction === 'get') {
        if (value === 'ct') return 'temperature';
        if (value === 'hs') return 'color';
        return null;
      } if (direction === 'set') {
        return null;
      }
    } else {
      return value;
    }

    return null;
  }

};
