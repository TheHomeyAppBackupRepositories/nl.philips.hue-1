'use strict';

const HueDriverLocal = require('../../lib/HueDriverLocal');
const HueDriverBulb = require('../../lib/HueDriverBulb');

class HueDriverLocalBulb extends HueDriverLocal {

}

HueDriverLocalBulb.prototype.onHueInit = HueDriverBulb.prototype.onHueInit;
HueDriverLocalBulb.prototype.onPairGetDevices = HueDriverBulb.prototype.onPairGetDevices;
HueDriverLocalBulb.prototype.onPairListDevice = HueDriverBulb.prototype.onPairListDevice;

module.exports = HueDriverLocalBulb;
