'use strict';

const Homey = require('homey');
const HueSyncBox = require('../../lib/HueSyncBox');

module.exports = class SyncBoxDevice extends Homey.Device {

  static POLL_INTERVAL = 5 * 1000;

  async onInit() {
    this.setUnavailable(this.homey.__('loading_syncbox'));

    if (!this.hasCapability('sync')) await this.addCapability('sync').catch(this.error);

    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
    this.registerCapabilityListener('hdmi-input', this.onCapabilityHDMIInput.bind(this));
    this.registerCapabilityListener('sync', this.onCapabilitySync.bind(this));
  }

  onPoll() {
    Promise.resolve().then(async () => {
      const {
        hdmiActive,
        hdmiSource,
        brightness,
        syncActive,
      } = await this.api.getExecution();

      this.setCapabilityValue('onoff', !!hdmiActive).catch(this.error);
      this.setCapabilityValue('dim', brightness / 200).catch(this.error);
      this.setCapabilityValue('sync', !!syncActive).catch(this.error);

      const oldHdmiSource = this.getCapabilityValue('hdmi-input');

      this.setCapabilityValue('hdmi-input', hdmiSource)
        .then(() => {
          if (oldHdmiSource !== hdmiSource) {
            this.homey.flow.getDeviceTriggerCard('hdmi-input_switched').trigger(this, {}, {
              hdmiSource,
            });
          }
        })
        .catch(this.error);

      await this.setAvailable();
    }).catch(err => {
      this.setUnavailable(err).catch(this.error);
    });
  }

  onDeleted() {
    if (this.onPollInterval) {
      this.homey.clearInterval(this.onPollInterval);
    }
  }

  async onDiscoveryAvailable(discoveryResult) {
    const { address } = discoveryResult;
    const { token } = this.getStore();

    this.api = new HueSyncBox({ address });
    this.api.setToken({ token });

    await this.setAvailable();

    this.onPollInterval = this.homey.setInterval(this.onPoll.bind(this), SyncBoxDevice.POLL_INTERVAL);
    this.onPoll();
  }

  async onCapabilityOnoff(value) {
    await this.api.setHDMIActive({
      active: value,
    });
  }

  async onCapabilityDim(value) {
    await this.api.setBrightness({
      brightness: Math.floor(value * 200),
    });
  }

  async onCapabilityHDMIInput(value) {
    await this.api.setInput({
      input: value,
    });
  }

  async onCapabilitySync(value) {
    await this.api.setSyncActive({
      active: value,
    });
  }

  async getInputs() {
    const inputs = await this.api.getHDMI();
    return Object.keys(inputs)
      .filter(key => key.startsWith('input'))
      .map(key => {
        const { name } = inputs[key];
        return {
          id: key,
          name,
        };
      });
  }

  async onRenamed(name) {
    if (!this.bridge) return;

    await this.bridge.setDeviceNameV2({
      name,
      id: await this.getDeviceIdV2(),
    });
  }

};
