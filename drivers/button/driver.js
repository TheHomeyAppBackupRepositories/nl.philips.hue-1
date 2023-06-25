'use strict';

const HueDriverLocal = require('../../lib/HueDriverLocal');
const HueDriverButton = require('../../lib/HueDriverButton');

class HueDriverLocalButton extends HueDriverLocal {

}

HueDriverLocalButton.prototype.onPairGetDevices = HueDriverButton.prototype.onPairGetDevices;
HueDriverLocalButton.prototype.onPairListDevice = HueDriverButton.prototype.onPairListDevice;

module.exports = HueDriverLocalButton;
