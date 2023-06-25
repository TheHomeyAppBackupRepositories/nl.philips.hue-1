/* eslint-disable quote-props */

'use strict';

module.exports = class HueDriverBulb {

  static CAPABILITIES_MAP = {
    'on/off light': ['onoff'],
    'on/off plug-in unit': ['onoff'],
    'dimmable light': ['onoff', 'dim'],
    'dimmable plug-in unit': ['onoff', 'dim'],
    'color temperature light': ['onoff', 'dim', 'light_temperature'],
    'color light': ['onoff', 'dim', 'light_hue', 'light_saturation'],
    'extended color light': ['onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode'],
  }

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
  };

  async onHueInit() {
    this.homey.flow.getActionCard('shortAlert').registerRunListener(({ device }) => device.shortAlert());
    this.homey.flow.getActionCard('longAlert').registerRunListener(({ device }) => device.longAlert());
    this.homey.flow.getActionCard('startColorLoop').registerRunListener(({ device }) => device.startColorLoop());
    this.homey.flow.getActionCard('stopColorLoop').registerRunListener(({ device }) => device.stopColorLoop());
    this.homey.flow.getActionCard('setGradient').registerRunListener(({
      device, color1, color2, color3,
    }) => device.setGradient({ color1, color2, color3 }));
  }

  async onPairGetDevices({ bridge }) {
    return bridge.getLights();
  }

  onPairListDevice({ device }) {
    if (device.type === 'On/Off plug-in unit') return null;

    const obj = {};

    const type = device.type.toLowerCase();
    const { modelid } = device;

    const capabilities = HueDriverBulb.CAPABILITIES_MAP[type];
    if (!capabilities) return null;
    obj.capabilities = capabilities;

    const icon = HueDriverBulb.ICONS_MAP[modelid];
    if (icon) obj.icon = `/icons/${icon}.svg`;

    return obj;
  }

};
