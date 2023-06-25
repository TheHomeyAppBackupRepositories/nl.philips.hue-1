'use strict';

const HueDriverLocal = require('../../lib/HueDriverLocal');
const HueDriverTapDial = require('../../lib/HueDriverTapDial');

class HueDriverLocalTapDial extends HueDriverLocal {

}

HueDriverLocalTapDial.prototype.onHueInit = HueDriverTapDial.prototype.onHueInit;

HueDriverLocalTapDial.prototype.onPairGetDevices = HueDriverTapDial.prototype.onPairGetDevices;
HueDriverLocalTapDial.prototype.onPairListDevice = HueDriverTapDial.prototype.onPairListDevice;

module.exports = HueDriverLocalTapDial;
