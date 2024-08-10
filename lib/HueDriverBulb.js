/* eslint-disable quote-props */

'use strict';

const HueError = require('./HueError');

module.exports = class HueDriverBulb {

  static ICONS_MAP = {
    LCT001: 'LCT001',
    LCT002: 'LCT002',
    LCT003: 'LCT003',
    LCT007: 'LCT001',
    LCT011: 'LCT002',
    LCT012: 'LCT012',
    LLC001: 'LLC001',
    LLC010: 'LLC010',
    LLC011: 'LLC011',
    LLC012: 'LLC011',
    LLC006: 'LLC010',
    LLC007: 'LLC007',
    LLC013: 'LLC013',
    LLC020: 'LLC020',
    LWB004: 'LCT001',
    LWB006: 'LWB006',
    LWB007: 'LCT001',
    LWB010: 'LWB006',
    LWB014: 'LWB006',
    LLM001: 'LCT001',
    LLM010: 'LCT001',
    LLM011: 'LCT001',
    LLM012: 'LCT001',
    LCF005: 'LCF005',
    LCS001: 'LCS001',
    LCT024: 'LCT024',
    '440400982841': 'LCT024',
    LDT001: 'LDT001',
    LST001: 'LST001',
    LST002: 'LST001',
    LST003: 'LST001',
    LWF001: 'LWF001',
    LTW001: 'LCT001',
    LTW004: 'LCT001',
    LTW010: 'LCT001',
    LTW011: 'LCT001',
    LTW012: 'LCT012',
    LTW015: 'LCT001',
    LTW013: 'LCT003',
    'Plug 01': 'socket',
    '915005987201': 'signe-floor', // Black
    '915005987101': 'signe-floor', // White
    '915005987001': 'signe-table', // Black
    '915005986901': 'signe-table', // White
    LCX004: 'LST001',
  };

  async onHueInit() {
    const handleEffectError = e => {
      if (e.message.includes('invalid attribute value')) {
        throw new HueError(this.homey.__('effect_unsupported'));
      }

      if (e.message.includes('soft off')) {
        throw new HueError(this.homey.__('effect_soft_off'));
      }

      throw new HueError(this.homey.__('effect_failed'));
    };

    this.homey.flow.getActionCard('shortAlert').registerRunListener(({ device }) => device.alertV2());
    this.homey.flow.getActionCard('longAlert').registerRunListener(({ device }) => device.alertV2());
    this.homey.flow.getActionCard('startColorLoop').registerRunListener(({ device }) => device.setEffect('prism')
      .catch(handleEffectError));
    this.homey.flow.getActionCard('stopColorLoop').registerRunListener(({ device }) => device.setEffect('no_effect'));
    this.homey.flow.getActionCard('setGradient').registerRunListener(({
      device, color1, color2, color3,
    }) => device.setGradient({ color1, color2, color3 }));

    this.homey.flow.getActionCard('alert').registerRunListener(({ device }) => device.alertV2());
    this.homey.flow.getActionCard('startEffect')
      .registerRunListener(({ device, effect }) => device.setEffect(effect.id).catch(handleEffectError))
      .registerArgumentAutocompleteListener('effect', (query, { device }) => {
        return device.effects;
      });
    this.homey.flow.getActionCard('stopEffect').registerRunListener(({ device }) => device.setEffect('no_effect'));
  }

  async onPairGetDevices({ bridge }) {
    return bridge.getDevicesV2();
  }

  onPairListDevice({ device }) {
    const deviceArchetype = device.product_data.product_archetype;

    // Filter out non-light devices
    if (['unknown_archetype', 'bridge_v2', 'plug'].includes(deviceArchetype)) return null;

    const obj = {};

    const modelid = device.product_data.model_id;
    const icon = HueDriverBulb.ICONS_MAP[modelid];
    if (icon) obj.icon = `/icons/${icon}.svg`;

    return obj;
  }

};
