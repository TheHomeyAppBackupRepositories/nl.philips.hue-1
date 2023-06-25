'use strict';

const Q42HueColorConverter = require('@q42philips/hue-color-converter');

module.exports = class HueUtil {

  static async nextTick() {
    return new Promise(resolve => {
      process.nextTick(resolve);
    });
  }

  static async wait(timeout = 1000) {
    await new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  static hexToXyColor(hex = '#FF0000') {
    if (typeof hex !== 'string') {
      throw new Error(`Invalid Hex: ${hex}`);
    }

    if (hex.startsWith('#')) {
      hex = hex.substring(1);
    }

    if (hex.length !== 6) {
      throw new Error(`Invalid Hex: ${hex}`);
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const [x, y] = Q42HueColorConverter.calculateXY(r, g, b);
    return {
      color: {
        xy: { x, y },
      },
    };
  }

};
