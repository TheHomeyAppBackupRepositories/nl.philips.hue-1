'use strict';

const HueDriverLocal = require('../../lib/HueDriverLocal');
const HueDriverTap = require('../../lib/HueDriverTap');

class HueDriverLocalTap extends HueDriverLocal {

}

HueDriverLocalTap.prototype.onHueInit = HueDriverTap.prototype.onHueInit;

HueDriverLocalTap.prototype.onPairGetDevices = HueDriverTap.prototype.onPairGetDevices;
HueDriverLocalTap.prototype.onPairListDevice = HueDriverTap.prototype.onPairListDevice;

module.exports = HueDriverLocalTap;
