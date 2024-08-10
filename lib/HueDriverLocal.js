'use strict';

const Homey = require('homey');

const HueError = require('./HueError');
const HueUtil = require('./HueUtil');

module.exports = class HueDriverLocal extends Homey.Driver {

  static CREATE_USER_INTERVAL = 3 * 1000;

  async onInit() {
    await this.onHueInit();
  }

  async onHueInit() {
    // Overload Me
  }

  async onPair(session) {
    this.homey.app.discovery.enableDiscovery();
    await HueUtil.wait(1000);

    const bridges = this.homey.app.getLocalBridges();
    let bridge;
    let pollInterval;

    const onViewCheckAuthentication = async () => {
      if (bridge && !!bridge.username) {
        session.showView('list_devices');
      } else {
        session.showView('authenticate');
      }
    };

    const onViewAuthenticate = async () => {
      const tryCreateUser = () => {
        this.log('Try createUser...');
        bridge.createUser()
          .then(async () => {
            if (pollInterval) {
              this.homey.clearInterval(pollInterval);
              pollInterval = null;
            }

            await session.showView('list_devices');
          })
          .catch(err => {
            if (err.type === 101 || err.message === 'link button not pressed') return;

            this.error(err);
            session.emit('error', err.message || err.toString());
          });
      };

      pollInterval = this.homey.setInterval(() => {
        tryCreateUser();
      }, HueDriverLocal.CREATE_USER_INTERVAL);
      tryCreateUser();
    };

    const onListBridges = async () => {
      return Array.from(bridges.values())
        .map(bridge => ({
          name: bridge.name,
          icon: bridge.icon,
          data: {
            id: bridge.id,
          },
        }));
    };

    const onListBridgesSelection = async ([selectedBridge]) => {
      const { id } = selectedBridge.data;

      if (!bridges.has(id)) {
        throw new Error('Invalid Bridge');
      }

      bridge = bridges.get(id);
    };

    const onListBridgeDevices = async () => {
      const devices = await this.onPairGetDevices({ bridge });

      const currentDeviceV2Ids = this.getDevices().map(device => device.getDeviceIdV2());

      return Object.values(devices).map(device => {
        const obj = this.onPairListDevice({ device });
        if (obj === null) return null;

        return {
          ...obj,
          name: device.metadata.name,
          data: {
            id: device.id,
            bridge_id: bridge.id,
          },
          store: {
            converted_v2: true,
            deviceIdV2: device.id,
            servicesV2: device.services,
          },
          settings: {
            Model_ID: device.product_data.model_id,
          },
        };
      }).filter(device => {
        if (!device) {
          return false;
        }

        // We need to filter on existing v2 ids manually, as converted V1 devices are stored with a
        // different identifier causing Homey to not detect them as duplicates.
        return !currentDeviceV2Ids.includes(device.data.id);
      });
    };

    const onListDevices = async () => {
      if (bridge) return onListBridgeDevices();
      return onListBridges();
    };

    const onDisconnect = async () => {
      if (pollInterval) {
        this.homey.clearInterval(pollInterval);
      }
    };

    session.setHandler('disconnect', async data => onDisconnect(data));
    session.setHandler('list_devices', async data => onListDevices(data));
    session.setHandler('list_bridges_selection', async data => onListBridgesSelection(data));
    session.setHandler('showView', async viewId => {
      switch (viewId) {
        case 'check_authentication':
          await onViewCheckAuthentication();
          break;
        case 'authenticate':
          await onViewAuthenticate();
          break;
        default:
          break;
      }
    });
  }

  async onRepair(session, device) {
    const { bridge } = device;
    let pollInterval;

    if (!bridge) {
      throw new HueError('Hue Bridge Not Found');
    }

    const onViewAuthenticate = async () => {
      const tryCreateUser = () => {
        this.log('Try createUser...');
        bridge.createUser()
          .then(async () => {
            if (pollInterval) {
              this.homey.clearInterval(pollInterval);
              pollInterval = null;
            }

            await session.done();
          })
          .catch(err => {
            if (err.type === 101 || err.message === 'link button not pressed') return;

            this.error(err);
            session.emit('error', err.message || err.toString());
          });
      };

      pollInterval = this.homey.setInterval(() => {
        tryCreateUser();
      }, HueDriverLocal.CREATE_USER_INTERVAL);
      tryCreateUser();
    };

    const onDisconnect = async () => {
      if (pollInterval) {
        this.homey.clearInterval(pollInterval);
      }
    };

    session.setHandler('disconnect', async data => onDisconnect(data));
    session.setHandler('showView', async viewId => {
      switch (viewId) {
        case 'authenticate':
          await onViewAuthenticate();
          break;
        default:
          break;
      }
    });
  }

};
