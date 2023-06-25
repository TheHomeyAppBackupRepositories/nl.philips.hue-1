'use strict';

const HueDriverCloud = require('../../lib/HueDriverCloud');
const HueDriverBulb = require('../../lib/HueDriverBulb');

class HueDriverCloudBulb extends HueDriverCloud {

}

HueDriverCloudBulb.prototype.onHueInit = HueDriverBulb.prototype.onHueInit;
HueDriverCloudBulb.prototype.onPairGetDevices = HueDriverBulb.prototype.onPairGetDevices;
HueDriverCloudBulb.prototype.onPairListDevice = HueDriverBulb.prototype.onPairListDevice;

module.exports = HueDriverCloudBulb;
