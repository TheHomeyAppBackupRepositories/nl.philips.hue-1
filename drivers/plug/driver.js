'use strict';

const HueDriverLocal = require('../../lib/HueDriverLocal');
const HueDriverPlug = require('../../lib/HueDriverPlug');

class HueDriverLocalPlug extends HueDriverLocal {

}

HueDriverLocalPlug.prototype.onPairGetDevices = HueDriverPlug.prototype.onPairGetDevices;
HueDriverLocalPlug.prototype.onPairListDevice = HueDriverPlug.prototype.onPairListDevice;

module.exports = HueDriverLocalPlug;
