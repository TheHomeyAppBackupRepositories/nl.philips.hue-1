'use strict';

const HueDriverLocal = require('../../lib/HueDriverLocal');
const HueDriverDimmerSwitch2 = require('../../lib/HueDriverDimmerSwitch2');

class HueDriverLocalDimmerSwitch2 extends HueDriverLocal {

}

HueDriverLocalDimmerSwitch2.prototype.onHueInit = HueDriverDimmerSwitch2.prototype.onHueInit;

HueDriverLocalDimmerSwitch2.prototype.onPairGetDevices = HueDriverDimmerSwitch2.prototype.onPairGetDevices;
HueDriverLocalDimmerSwitch2.prototype.onPairListDevice = HueDriverDimmerSwitch2.prototype.onPairListDevice;

module.exports = HueDriverLocalDimmerSwitch2;
