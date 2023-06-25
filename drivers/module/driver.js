'use strict';

const HueDriverLocal = require('../../lib/HueDriverLocal');
const HueDriverModule = require('../../lib/HueDriverModule');

class HueDriverLocalModule extends HueDriverLocal {

}

HueDriverLocalModule.prototype.onPairGetDevices = HueDriverModule.prototype.onPairGetDevices;
HueDriverLocalModule.prototype.onPairListDevice = HueDriverModule.prototype.onPairListDevice;

module.exports = HueDriverLocalModule;
