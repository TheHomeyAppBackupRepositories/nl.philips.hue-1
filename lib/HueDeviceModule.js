'use strict';

module.exports = class HueDeviceModule {

  static HUE_DEVICE_TYPE = 'sensor';

  async onHueInit() {
    this.log(`Device: ${this.device.name}, Model: ${this.device.modelid}`);
  }

  async onHuePoll() {
    if (!this.device.state) return;
    if (!this.device.config) return;

    const {
      lastupdated,
      buttonevent,
    } = this.device.state;

    const {
      battery,
      devicemode,
    } = this.device.config;

    // Set battery
    if (typeof battery === 'number') {
      this.setCapabilityValue('measure_battery', battery).catch(this.error);
    }

    // Sync capability for Flow card filter
    if (devicemode.endsWith('rocker') && !this.hasCapability('module-type-rocker')) {
      this.addCapability('module-type-rocker').catch(this.error);
      this.removeCapability('module-type-push').catch(this.error);
    }

    if (devicemode.endsWith('pushbutton') && !this.hasCapability('module-type-push')) {
      this.addCapability('module-type-push').catch(this.error);
      this.removeCapability('module-type-rocker').catch(this.error);
    }

    // Initial load, don't trigger a Flow when the app has just started
    if (typeof this.buttonevent === 'undefined') {
      this.lastupdated = lastupdated;
      this.buttonevent = buttonevent;
    } else if (lastupdated !== this.lastupdated) {
      // Type: Rocker
      if (devicemode.endsWith('rocker')) {
        if (buttonevent === 1002 || buttonevent === 1000) {
          this.homey.flow
            .getDeviceTriggerCard('module_rocker_button_one_pressed')
            .trigger(this)
            .catch(this.error);
        } else if (buttonevent === 2002 || buttonevent === 2000) {
          this.homey.flow
            .getDeviceTriggerCard('module_rocker_button_two_pressed')
            .trigger(this)
            .catch(this.error);
        }
      }

      // Type: Push
      if (devicemode.endsWith('pushbutton')) {
        if (buttonevent === 1000 || buttonevent === 1001 || buttonevent === 1002) {
          if (this.push_one_on !== true) {
            this.push_one_on = true;
            this.homey.flow
              .getDeviceTriggerCard('module_push_button_one_turned_on')
              .trigger(this)
              .catch(this.error);
          }
        }

        if (buttonevent === 1002 || buttonevent === 1003) {
          if (this.push_one_on !== false) {
            this.push_one_on = false;
            this.homey.flow
              .getDeviceTriggerCard('module_push_button_one_turned_off')
              .trigger(this)
              .catch(this.error);
          }
        }

        if (buttonevent === 2000 || buttonevent === 2001 || buttonevent === 2002) {
          if (this.push_two_on !== true) {
            this.push_two_on = true;
            this.homey.flow
              .getDeviceTriggerCard('module_push_button_two_turned_on')
              .trigger(this)
              .catch(this.error);
          }
        }

        if (buttonevent === 2002 || buttonevent === 2003) {
          if (this.push_two_on !== false) {
            this.push_two_on = false;
            this.homey.flow
              .getDeviceTriggerCard('module_push_button_two_turned_off')
              .trigger(this)
              .catch(this.error);
          }
        }
      }

      this.lastupdated = lastupdated;
      this.buttonevent = buttonevent;
    }
  }

  async onRenamed(name) {
    if (!this.bridge) return;

    await this.bridge.setSensorName({
      name,
      id: this.device.id,
    });
  }

};
