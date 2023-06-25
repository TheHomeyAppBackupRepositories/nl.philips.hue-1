'use strict';

const HueDeviceDimmerSwitch = require('./HueDeviceDimmerSwitch');

module.exports = class HueDeviceDimmerSwitch2 extends HueDeviceDimmerSwitch {

  static BUTTON_EVENT_MAP = {
    1: 'on',
    2: 'increase_brightness',
    3: 'decrease_brightness',
    4: 'hue',
  };

};
