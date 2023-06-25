'use strict';

const HueDriverLocal = require('../../lib/HueDriverLocal');
const HueDriverDimmerSwitch = require('../../lib/HueDriverDimmerSwitch');

class HueDriverLocalDimmerSwitch extends HueDriverLocal {

}

HueDriverLocalDimmerSwitch.prototype.onHueInit = HueDriverDimmerSwitch.prototype.onHueInit;

HueDriverLocalDimmerSwitch.prototype.onPairGetDevices = HueDriverDimmerSwitch.prototype.onPairGetDevices;
HueDriverLocalDimmerSwitch.prototype.onPairListDevice = HueDriverDimmerSwitch.prototype.onPairListDevice;

module.exports = HueDriverLocalDimmerSwitch;
