'use strict';

const Homey = require('homey');
const HueSyncBox = require('../../lib/HueSyncBox');

module.exports = class SyncBoxDriver extends Homey.Driver {

  async onInit() {
    this.homey.flow.getActionCard('set_input')
      .registerRunListener(async ({ device, input }) => {
        return device.triggerCapabilityListener('hdmi-input', input.id);
      })
      .getArgument('input')
      .registerAutocompleteListener(async (query, { device }) => {
        return device.getInputs();
      });

    this.homey.flow.getDeviceTriggerCard('hdmi-input_switched')
      .registerRunListener((args, state) => {
        return args.input.id === 'any' || state.hdmiSource === args.input.id;
      })
      .getArgument('input')
      .registerAutocompleteListener(async (query, { device }) => {
        return device.getInputs().then(res => {
          res.unshift(
            {
              id: 'any',
              name: this.homey.__('any_hdmi_input'),
            },
          );
          return res;
        });
      });
  }

  async onPair(session) {
    let api;
    let device;
    let discoveryResults;
    let pollInterval;

    const onShowViewAuthenticate = async () => {
      pollInterval = setInterval(() => {
        this.log('Try createRegistration...');
        api.createRegistration().then(token => {
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
            session.emit('add_device', {
              ...device,
              store: {
                token,
              },
            });
          }
        }).catch(err => {
          if (err.statusCode === 400 || err.message === 'Invalid State') {
            this.log('Not Yet Pushed');
            return;
          }

          this.error(err);
          session.emit('error', err.message || err.toString());
        });
      }, 2500);
    };

    session.setHandler('showView', async viewId => {
      switch (viewId) {
        case 'authenticate': {
          await onShowViewAuthenticate();
          break;
        }
        default: {
          break;
        }
      }
    });

    session.setHandler('list_devices', async () => {
      const discoveryStrategy = this.getDiscoveryStrategy();
      discoveryResults = discoveryStrategy.getDiscoveryResults();

      return Object.values(discoveryResults).map(discoveryResult => ({
        name: discoveryResult.txt.name,
        data: {
          id: discoveryResult.id,
        },
      }));
    });

    session.setHandler('list_devices_selection', async data => {
      device = data[0];
      const { address } = discoveryResults[device.data.id];
      api = new HueSyncBox({ address });
    });

    session.setHandler('disconnect', async () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    });
  }

};
