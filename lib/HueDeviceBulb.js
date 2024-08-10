'use strict';

const HueUtil = require('./HueUtil');

module.exports = class HueDeviceBulb {

  static HUE_DEVICE_TYPE = 'light';
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
    LCX004: { approximation: { usageOff: 0.5, usageOn: 20.0 } },
  };

  async onHueInit() {
    const V2ID = await this.getDeviceIdV2();

    const deviceEnergy = this.getEnergy();
    const driverEnergy = HueDeviceBulb.ENERGY_MAP[this.device.modelid] || null;

    if (JSON.stringify(deviceEnergy) !== JSON.stringify(driverEnergy)) {
      this.log('Energy out of sync, updating...');
      this.setEnergy(driverEnergy).catch(this.error);
    }

    for (const service of this.device.services) {
      if (service.rtype === 'light') {
        this.lightId = service.rid;
        break;
      }
    }

    // Determine light capabilities
    const light = await this.bridge.getLightV2({ id: this.lightId });

    this.bridge.registerV2(V2ID, this);
    this.bridge.registerV2(this.lightId, this);

    this.log(`Device: ${this.device.metadata.name}, Model: ${this.device.product_data.model_id}`);
    this.log('Light:', this.lightId);

    // Dimming
    const supportsDimming = light.dimming !== undefined;
    const hasDimming = this.hasCapability('dim');

    if (supportsDimming && !hasDimming) await this.addCapability('dim');
    if (!supportsDimming && hasDimming) await this.removeCapability('dim');

    this.log(`Light ${supportsDimming ? 'supports' : 'does not support'} dimming`);

    // Color Temperature
    const supportsTemperature = light.color_temperature !== undefined;
    const hasTemperature = this.hasCapability('light_temperature');

    if (supportsTemperature && !hasTemperature) await this.addCapability('light_temperature');
    if (!supportsTemperature && hasTemperature) await this.removeCapability('light_temperature');

    this.log(`Light ${supportsTemperature ? 'supports' : 'does not support'} color temperature`);

    // Color
    const supportsColor = light.color !== undefined;
    const hasColor = this.hasCapability('light_hue');

    if (supportsColor && !hasColor) {
      await this.addCapability('light_hue');
      await this.addCapability('light_saturation');
    }
    if (!supportsColor && hasColor) {
      await this.removeCapability('light_hue');
      await this.removeCapability('light_saturation');
    }

    this.log(`Light ${supportsColor ? 'supports' : 'does not support'} color`);

    // Color/White Switching
    const hasMode = this.hasCapability('light_mode');
    if (supportsTemperature && supportsColor && !hasMode) await this.addCapability('light_mode');
    if ((!(supportsTemperature && supportsColor)) && hasMode) await this.removeCapability('light_mode');

    const hasLightEffects = light.effects?.effect_values !== undefined;
    this.log((`Light has ${hasLightEffects ? `effects: ${light.effects.effect_values}` : 'no effects'}`));
    this.effects = [];
    if (hasLightEffects === true) {
      this.effects = await light.effects.effect_values
        .filter(effect => effect !== 'no_effect')
        .map(effect => ({ name: HueUtil.snakeCaseToName(effect), id: effect }));
    }

    // Gradient
    const supportsGradient = light.gradient !== undefined;
    const hasGradient = this.hasCapability('light-gradient');

    if (supportsGradient && !hasGradient) {
      await this.addCapability('light-gradient');
    }
    if (!supportsGradient && hasGradient) {
      await this.removeCapability('light-gradient');
    }

    this.log(`Light ${supportsGradient ? 'supports' : 'does not support'} gradient`);

    // Listeners
    const capabilities = this.getCapabilities();
    this.registerMultipleCapabilityListener(capabilities, this.onCapabilityAll.bind(this), 200);

    // Set initial light state
    await this.onHueEventUpdate(light);
  }

  async onHueDeleted() {
    this.bridge.unregisterV2(await this.getDeviceIdV2());
    this.bridge.unregisterV2(this.lightId);
  }

  async onHueEventUpdate(update) {
    this.log('Update:', update.type);
    if (update.type === 'light') {
      if (update.on?.on !== undefined) {
        await this.setCapabilityValue('onoff', update.on.on).catch(this.error);
      }
      if (update.dimming?.brightness !== undefined) {
        await this.setCapabilityValue('dim', update.dimming.brightness / 100).catch(this.error);
      }
      const temperatureUpdated = update.color_temperature !== undefined && update.color_temperature.mirek_valid;
      if (temperatureUpdated) {
        const temperature = HueDeviceBulb.convert('light_temperature', 'get', update.color_temperature.mirek);
        await this.setCapabilityValue('light_temperature', temperature).catch(this.error);
      }
      if (update.color !== undefined && !temperatureUpdated) {
        const [hue, saturation] = HueUtil.HueXYtoHS(update.color.xy.x, update.color.xy.y);
        await this.setCapabilityValue('light_hue', hue).catch(this.error);
        await this.setCapabilityValue('light_saturation', saturation).catch(this.error);
      }
    } else {
      this.error('Unknown update:', JSON.stringify(update));
    }
  }

  async onRenamed(name) {
    if (!this.bridge) return;

    await this.bridge.setDeviceNameV2({
      name,
      id: await this.getDeviceIdV2(),
    });
  }

  async onCapabilityAll(valueObj, optionsObj) {
    const state = {};

    if (typeof valueObj['onoff'] !== 'undefined') {
      state.on = {
        on: valueObj['onoff'],
      };
    }

    if (typeof valueObj['dim'] !== 'undefined') {
      state.dimming = {
        brightness: valueObj['dim'] * 100,
      };
      if (valueObj['dim'] === 0) {
        state.on = {
          on: false,
        };
      } else {
        state.on = {
          on: true,
        };
      }
    }

    if (typeof valueObj['light_temperature'] !== 'undefined') {
      state.color_temperature = {
        mirek: HueDeviceBulb.convert('light_temperature', 'set', valueObj['light_temperature']),
      };
    } else if (valueObj['light_hue'] !== undefined || valueObj['light_saturation'] !== undefined) {
      const xyColor = HueUtil.HueHStoXY(
        valueObj['light_hue'] ?? this.getCapabilityValue('light_hue'),
        valueObj['light_saturation'] ?? this.getCapabilityValue('light_saturation'),
      );
      state.color = {
        xy: {
          x: xyColor[0],
          y: xyColor[1],
        },
      };
    }

    // Add transition
    for (const { duration } of Object.values(optionsObj)) {
      if (typeof duration === 'number') {
        state.dynamics = {
          duration,
        };
      }
    }

    this.log('New State:', state);

    if (Object.keys(state).length) {
      await this.setLightStateV2(state);
    }
  }

  // @deprecated used in legacy flows
  async setLightState(state) {
    return this.bridge.setLightState({
      state,
      id: this.device.id,
    });
  }

  async setLightStateV2(state) {
    return this.bridge.setLightStateV2({
      id: this.lightId,
      state,
    });
  }

  // @deprecated used in legacy flows
  async shortAlert() {
    return this.setLightState({
      alert: 'select',
    });
  }

  // @deprecated used in legacy flows
  async longAlert() {
    return this.setLightState({
      alert: 'lselect',
    });
  }

  async alertV2() {
    return this.setLightStateV2({
      alert: { action: 'breathe' },
    });
  }

  // @deprecated used in legacy flows
  async startColorLoop() {
    await this.setLightState({
      on: true,
      effect: 'colorloop',
      alert: 'none',
    });
    await this.setCapabilityValue('onoff', true).catch(this.error);
  }

  // @deprecated used in legacy flows
  async stopColorLoop() {
    return this.setLightState({
      effect: 'none',
      alert: 'none',
    });
  }

  async setEffect(effect) {
    return this.setLightStateV2({
      effects: {
        effect,
      },
    });
  }

  async setGradient({
    color1,
    color2,
    color3,
  }) {
    await this.bridge.putV2({
      path: `/resource/light/${this.lightId}`,
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
    if (capabilityId === 'light_hue') {
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
