'use strict';

const { OAuth2App } = require('homey-oauth2app');

const HueOAuth2Client = require('./HueOAuth2Client');
const HueBridgeCloud = require('./HueBridgeCloud');
const HueDiscovery = require('./HueDiscovery');
const HueError = require('./HueError');

module.exports = class HueApp extends OAuth2App {

  static OAUTH2_CLIENT = HueOAuth2Client;
  static OAUTH2_DEBUG = false;
  static OAUTH2_DRIVERS = ['bulb_cloud', 'socket_cloud'];

  groupIdConversion = {};
  sceneIdConversions = {};

  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.bridges = new Map();

    this.discovery = new HueDiscovery({
      homey: this.homey,
    });

    this.homey.flow
      .getActionCard('setScene')
      .registerRunListener((...props) => this.onFlowActionSetScene(...props))
      .getArgument('scene')
      .registerAutocompleteListener((...props) => this.onFlowAutocompleteScene(...props));

    this.homey.flow
      .getActionCard('groupOn')
      .registerRunListener((...props) => this.onFlowActionGroupOn(...props))
      .getArgument('group')
      .registerAutocompleteListener((...props) => this.onFlowAutocompleteGroup(...props));

    this.homey.flow
      .getActionCard('groupOff')
      .registerRunListener((...props) => this.onFlowActionGroupOff(...props))
      .getArgument('group')
      .registerAutocompleteListener((...props) => this.onFlowAutocompleteGroup(...props));

    this.homey.flow
      .getActionCard('groupSetBrightness')
      .registerRunListener((...props) => this.onFlowActionGroupSetBrightness(...props))
      .getArgument('group')
      .registerAutocompleteListener((...props) => this.onFlowAutocompleteGroup(...props));

    this.log(`Running ${this.manifest.id} v${this.manifest.version}...`);
  }

  /*
   * Bridge Management
   */

  async getBridgeAsync(bridgeId) {
    if (bridgeId === 'cloud') {
      if (!this.cloudBridgePromise) {
        this.cloudBridgePromise = Promise.resolve().then(async () => {
          const oAuth2Client = this.getFirstSavedOAuth2Client();
          oAuth2Client.once('destroy', () => {
            delete this.cloudBridge;
          });

          const bridge = new HueBridgeCloud({
            oAuth2Client,
            homey: this.homey,
          });

          await bridge.init().catch(err => {
            this.error(err);
            throw err;
          });

          this.cloudBridge = bridge;

          return bridge;
        });
        this.cloudBridgePromise.catch(() => {
          delete this.cloudBridge;
          delete this.cloudBridgePromise;
        });
      }

      return this.cloudBridgePromise;
    }

    return this.discovery.getBridgeAsync(bridgeId);
  }

  getLocalBridges() {
    return this.discovery.getBridges();
  }

  getBridges() {
    const bridges = Array.from(this.getLocalBridges().values());

    if (this.cloudBridge) {
      bridges.push(this.cloudBridge);
    }

    return bridges;
  }

  /*
   * Flow
   */

  async getSceneIdV2(id, bridge) {
    // Check if this is already a v2 id
    if (id.length <= 16) {
      const storedId = this.sceneIdConversions[id];

      if (storedId !== undefined) {
        this.log('Converted v1 scene id:', id, 'to', storedId);
        return storedId;
      }

      const scenes = await bridge.getScenesV2();

      for (const scene of scenes) {
        if (scene.id_v1.substring(8) === id) {
          const V2ID = scene.id;
          this.sceneIdConversions[id] = V2ID;
          this.log('Found v2 id', V2ID, 'for v1 scene id', id);
          return V2ID;
        }
      }

      throw new HueError(`Scene ${id} could not be found`);
    }

    return id;
  }

  async getGroupIdV2(id, bridge) {
    const idString = `${id}`;
    const storedId = this.groupIdConversion[idString];

    if (storedId !== undefined) {
      this.log('Converted v1 group id:', id, 'to', storedId);
      return storedId;
    }

    const groups = await bridge.getGroupsV2();

    for (const group of groups) {
      if (group.id_v1.substring(8) === idString) {
        const V2ID = group.id;
        this.groupIdConversion[idString] = V2ID;
        this.log('Found v2 id', V2ID, 'for v1 group id', id);
        return V2ID;
      }
    }

    throw new HueError(`Group ${id} could not be found`);
  }

  async onFlowActionSetScene({ scene }) {
    const bridge = await this.getBridgeAsync(scene.bridge_id);
    await bridge.setSceneV2({
      id: await this.getSceneIdV2(scene.id, bridge),
    });
  }

  async onFlowActionGroupOn({ group }) {
    const bridge = await this.getBridgeAsync(group.bridge_id);
    const groupId = group.grouped_light ?? await this.getGroupIdV2(group.id, bridge);
    await bridge.setGroupStateV2({
      id: groupId,
      state: {
        on: { on: true },
      },
    });
  }

  async onFlowActionGroupOff({ group }) {
    const bridge = await this.getBridgeAsync(group.bridge_id);
    const groupId = group.grouped_light ?? await this.getGroupIdV2(group.id, bridge);
    await bridge.setGroupStateV2({
      id: groupId,
      state: {
        on: { on: false },
      },
    });
  }

  async onFlowActionGroupSetBrightness({ group, brightness, duration }) {
    const bridge = await this.getBridgeAsync(group.bridge_id, false);
    const groupId = group.grouped_light ?? await this.getGroupIdV2(group.id, bridge);
    const state = {
      dimming: { brightness },
    };

    if (brightness === 0) {
      state.on = {
        on: false,
      };
    } else {
      state.on = {
        on: true,
      };
    }

    if (typeof duration === 'number') {
      state.dynamics = {
        duration,
      };
    }

    return bridge.setGroupStateV2({
      state,
      id: groupId,
    });
  }

  async onFlowAutocompleteScene(query) {
    const bridges = this.getBridges();

    const getScenesPromises = Array.from(bridges).map(bridge => {
      return bridge.getScenesV2()
        .then(scenes => ({ bridge, scenes }))
        .catch(err => err);
    });

    const results = await Promise.all(getScenesPromises);
    const resultArray = [];

    results.forEach(result => {
      if (result instanceof Error) return;
      const { bridge, scenes } = result;

      for (const scene of scenes) {
        resultArray.push({
          id: scene.id,
          bridge_id: bridge.id,
          name: scene.metadata.name,
          description: bridge.name,
        });
      }
    });

    return resultArray.filter(resultArrayItem => {
      return resultArrayItem.name.toLowerCase().includes(query.toLowerCase());
    });
  }

  async onFlowAutocompleteGroup(query) {
    const bridges = this.getBridges();

    const getGroupsPromises = Object.values(bridges).map(async bridge => {
      const rooms = await bridge.getRoomsV2().catch(err => err);
      const zones = await bridge.getZonesV2().catch(err => err);
      const homes = await bridge.getHomesV2().catch(err => err);

      return {
        bridge,
        rooms,
        zones,
        homes,
      };
    }).map(promise => promise.catch(err => err));

    const results = await Promise.all(getGroupsPromises);
    const resultArray = [];

    for (const bridgeResult of results) {
      if (bridgeResult instanceof Error) continue;
      if (bridgeResult.rooms instanceof Error || bridgeResult.homes instanceof Error) continue;

      const {
        bridge,
        rooms,
        zones,
        homes,
      } = bridgeResult;

      // There should be one grouped_light associated with this home
      if (homes.length !== 1) {
        this.error('Unexpected amount of homes for bridge', bridge.id, ':', rooms);
        continue;
      }
      const home = homes[0];

      const groupedLightServices = home.services.filter(service => service.rtype === 'grouped_light');

      if (groupedLightServices.length < 1) {
        this.error('Could not find grouped_light in home', home.id, ':', home.services);
        continue;
      }

      const homeService = groupedLightServices[0];

      resultArray.push({
        id: home.id,
        grouped_light: homeService.rid,
        bridge_id: bridge.id,
        name: this.homey.__('all_lights'),
        description: bridge.name,
      });

      for (const room of rooms) {
        // There should be one grouped_light associated with this room
        const groupedLightServices = room.services.filter(service => service.rtype === 'grouped_light');

        if (groupedLightServices < 1) {
          this.error('Could not find grouped_light in room', room.id, ':', room.services);
          continue;
        }

        const roomService = groupedLightServices[0];
        resultArray.push({
          id: room.id,
          grouped_light: roomService.rid,
          bridge_id: bridge.id,
          name: room.metadata.name,
          description: bridge.name,
        });
      }

      for (const zone of zones) {
        // Get the grouped_light service from the zone
        const groupedLightServices = zone.services.filter(service => service.rtype === 'grouped_light');

        if (groupedLightServices.length < 1) {
          this.error('Could not find grouped_light in zone', zone.id, ':', zone.services);
          continue;
        }

        const zoneService = groupedLightServices[0];
        resultArray.push({
          id: zone.id,
          grouped_light: zoneService.rid,
          bridge_id: bridge.id,
          name: zone.metadata.name,
          description: bridge.name,
        });
      }
    }

    return resultArray.filter(resultArrayItem => {
      return resultArrayItem.name.toLowerCase().includes(query.toLowerCase());
    });
  }

};
