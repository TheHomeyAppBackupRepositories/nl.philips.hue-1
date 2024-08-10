'use strict';

const HueDriverLocal = require('../../lib/HueDriverLocal');
const HueDriverContactSensor = require('../../lib/HueDriverContactSensor');

class HueDriverLocalContactSensor extends HueDriverLocal {

}

HueDriverLocalContactSensor.prototype.onHueInit = HueDriverContactSensor.prototype.onHueInit;

HueDriverLocalContactSensor.prototype.onPairGetDevices = HueDriverContactSensor.prototype.onPairGetDevices;
HueDriverLocalContactSensor.prototype.onPairListDevice = HueDriverContactSensor.prototype.onPairListDevice;

module.exports = HueDriverLocalContactSensor;
