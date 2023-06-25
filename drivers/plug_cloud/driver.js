'use strict';

const HueDriverCloud = require('../../lib/HueDriverCloud');
const HueDriverPlug = require('../../lib/HueDriverPlug');

class HueDriverCloudPlug extends HueDriverCloud {

}

HueDriverCloudPlug.prototype.onPairGetDevices = HueDriverPlug.prototype.onPairGetDevices;
HueDriverCloudPlug.prototype.onPairListDevice = HueDriverPlug.prototype.onPairListDevice;

module.exports = HueDriverCloudPlug;
