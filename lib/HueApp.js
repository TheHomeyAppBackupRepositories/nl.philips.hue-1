'use strict';

const { OAuth2App } = require('homey-oauth2app');

const HueOAuth2Client = require('./HueOAuth2Client');
const HueBridgeCloud = require('./HueBridgeCloud');
const HueDiscovery = require('./HueDiscovery');

module.exports = class HueApp extends OAuth2App {

  static OAUTH2_CLIENT = HueOAuth2Client;
  static OAUTH2_DEBUG = false;
  static OAUTH2_DRIVERS = ['bulb_cloud', 'socket_cloud'];

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

  async onFlowActionSetScene({ scene }) {
    const bridge = await this.getBridgeAsync(scene.bridge_id);
    await bridge.setScene({
      id: scene.id,
    });
  }

  async onFlowActionGroupOn({ group }) {
    const bridge = await this.getBridgeAsync(group.bridge_id);
    await bridge.setGroupState({
      id: group.id,
      state: {
        on: true,
      },
    });
  }

  async onFlowActionGroupOff({ group }) {
    const bridge = await this.getBridgeAsync(group.bridge_id);
    await bridge.setGroupState({
      id: group.id,
      state: {
        on: false,
      },
    });
  }

  async onFlowActionGroupSetBrightness({ group, brightness, duration }) {
    const bridge = await this.getBridgeAsync(group.bridge_id, false);
    const state = {
      on: brightness !== 0,
      bri: parseInt(Math.floor((brightness / 100) * 254), 10),
    };

    if (typeof duration === 'number') {
      state.transitiontime = duration / 100;
    }

    return bridge.setGroupState({
      state,
      id: group.id,
    });
  }

  async onFlowAutocompleteScene(query) {
    const bridges = this.getBridges();

    const getScenesPromises = Array.from(bridges).map(bridge => {
      return bridge.getScenes()
        .then(scenes => ({ bridge, scenes }))
        .catch(err => err);
    });

    const results = await Promise.all(getScenesPromises);
    const resultArray = [];

    results.forEach(result => {
      if (result instanceof Error) return;
      const { bridge, scenes } = result;

      Object.keys(scenes).forEach(sceneId => {
        const scene = scenes[sceneId];
        resultArray.push({
          id: sceneId,
          bridge_id: bridge.id,
          name: scene.name.split(' on ')[0],
          description: bridge.name,
        });
      });
    });

    return resultArray.filter(resultArrayItem => {
      return resultArrayItem.name.toLowerCase().includes(query.toLowerCase());
    });
  }

  async onFlowAutocompleteGroup(query) {
    const bridges = this.getBridges();

    const getGroupsPromises = Object.values(bridges).map(bridge => {
      return bridge.getGroups()
        .then(groups => ({ bridge, groups }))
        .catch(err => err);
    });

    const results = await Promise.all(getGroupsPromises);
    const resultArray = [];

    results.forEach(result => {
      if (result instanceof Error) return;
      const { bridge, groups } = result;

      resultArray.push({
        id: 0,
        bridge_id: bridge.id,
        name: this.homey.__('all_lights'),
        description: bridge.name,
      });

      Object.keys(groups).forEach(groupId => {
        const group = groups[groupId];
        resultArray.push({
          id: groupId,
          bridge_id: bridge.id,
          name: group.name,
          description: bridge.name,
        });
      });
    });

    return resultArray.filter(resultArrayItem => {
      return resultArrayItem.name.toLowerCase().includes(query.toLowerCase());
    });
  }

};
