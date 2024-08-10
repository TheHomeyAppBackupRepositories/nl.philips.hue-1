'use strict';

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

  // More information about the color conversion can be found here:
  // https://developers.meethue.com/develop/application-design-guidance/color-conversion-formulas-rgb-to-xy-and-back/

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

    // Parse the hex value into RGB with 0-1 range
    const bigint = parseInt(hex, 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;

    const [x, y] = this.HueRgbToXY(r, g, b);

    return {
      color: {
        xy: { x, y },
      },
    };
  }

  /** Convert from the hue and saturation used by Homey to the CIE xy space used by Hue */
  static HueHStoXY(h, s) {
    const hue = h * 360;
    const saturation = s;
    const brightness = 1;

    // Convert HSB to RGB
    const chroma = brightness * saturation;
    const huePrime = hue / 60;
    const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
    let r; let g; let b;

    if (huePrime >= 0 && huePrime < 1) {
      [r, g, b] = [chroma, x, 0];
    } else if (huePrime >= 1 && huePrime < 2) {
      [r, g, b] = [x, chroma, 0];
    } else if (huePrime >= 2 && huePrime < 3) {
      [r, g, b] = [0, chroma, x];
    } else if (huePrime >= 3 && huePrime < 4) {
      [r, g, b] = [0, x, chroma];
    } else if (huePrime >= 4 && huePrime < 5) {
      [r, g, b] = [x, 0, chroma];
    } else {
      [r, g, b] = [chroma, 0, x];
    }

    // Adjust brightness
    const m = brightness - chroma;
    [r, g, b] = [r + m, g + m, b + m];

    // Normalize RGB values
    r = Math.min(1, Math.max(0, r));
    g = Math.min(1, Math.max(0, g));
    b = Math.min(1, Math.max(0, b));

    return this.HueRgbToXY(r, g, b);
  }

  // Convert RGB range 0-1 to CIE xyY
  static HueRgbToXY(r, g, b) {
    const X = r * 0.649926 + g * 0.103455 + b * 0.197109;
    const Y = r * 0.234327 + g * 0.743075 + b * 0.022598;
    const Z = r * 0.000000 + g * 0.053077 + b * 1.035763;

    const [xCoord, yCoord] = this.HueXYZtoXY(X, Y, Z);

    // Return rounded values up to 4 decimals to fit the resolution of the api
    return [Math.round(xCoord * 10000) / 10000, Math.round(yCoord * 10000) / 10000];
  }

  /** Convert from the CIE XYZ to CIE xyY space */
  static HueXYZtoXY(X, Y, Z) {
    const f = X + Y + Z;
    return [X / f, Y / f];
  }

  /**
   Convert from the CIE xyY to a scaled CIE XYZ space
   Since the original brightness is unknown this is not a true conversion
   With the values in xyY adding up to 1 we can keep the ratios though
  */
  static HueXYtoXYZ(x, y) {
    const z = 1.0 - x - y;
    return [x, y, z];
  }

  /** Convert from the CIE xy space used by Hue to the hue and saturation used by Homey  */
  static HueXYtoHS(x, y) {
    // Convert XY to RGB
    const z = 1.0 - x - y;
    const Y = 1; // value of brightness
    const X = (Y / y) * x;
    const Z = (Y / y) * z;

    const r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
    const g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
    const b = X * 0.051713 - Y * 0.121364 + Z * 1.011530;

    // Convert RGB to HSB
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    const brightnessPrime = Math.max(r, g, b);
    let saturation = chroma === 0 ? 0 : chroma / brightnessPrime;

    let hue;
    if (chroma === 0) {
      hue = 0;
    } else if (brightnessPrime === r) {
      hue = ((g - b) / chroma + 6) % 6;
    } else if (brightnessPrime === g) {
      hue = (b - r) / chroma + 2;
    } else {
      hue = (r - g) / chroma + 4;
    }

    hue *= 60;

    // Convert the calculated values to match the values Homey expects
    hue /= 360;
    // The CIE colorspace is larger than hsv, so we lose some saturation values in Homey
    saturation = Math.min(1, Math.max(0, saturation));
    // Return rounded values up to 4 decimals to fit the resolution of the api
    return [Math.round(hue * 10000) / 10000, Math.round(saturation * 10000) / 10000];
  }

  static snakeCaseToName(input) {
    // Split the input string by underscores
    const words = input.split('_');
    // Capitalize the first letter of each word
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    // Join the words with a space
    const result = capitalizedWords.join(' ');
    return result;
  }

};
