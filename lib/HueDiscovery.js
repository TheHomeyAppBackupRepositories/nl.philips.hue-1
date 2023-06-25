'use strict';

const { EventEmitter } = require('events');

const fetch = require('node-fetch');

const HueError = require('./HueError.js');
const HueBridgeLocal = require('./HueBridgeLocal.js');

module.exports = class HueDiscovery extends EventEmitter {

  // Why do we keep cloud discovery?
  // 1. It's more reliably than mDNS discovery
  // 2. It finds Hue Bridges outside of Homey Pro's IP range (e.g. 192.168.0.x -> 192.168.1.x)
  static NUPNP_URL = 'https://discovery.meethue.com';
  static DISCOVER_INTERVAL = 1000 * 60 * 20; // 20 min

  constructor({ homey }) {
    super();

    this.homey = homey;
    this.bridges = new Map();

    // Cloud Discovery
    this.homey.setInterval(() => this.discover(), HueDiscovery.DISCOVER_INTERVAL);

    // mDNS Discovery
    this.mdnsDiscoveryStrategy = this.homey.discovery.getStrategy('hue-bridge');
    this.mdnsDiscoveryStrategy.on('result', discoveryResult => {
      this._onMdnsDiscoveryResult(discoveryResult);
    });

    // Existing Discovery Results
    const discoveryResults = this.mdnsDiscoveryStrategy.getDiscoveryResults();
    Object.values(discoveryResults).forEach(discoveryResult => {
      this._onMdnsDiscoveryResult(discoveryResult);
    });
  }

  _onMdnsDiscoveryResult(discoveryResult) {
    discoveryResult.on('addressChanged', discoveryResult => {
      this._onDiscoveryResult({
        id: discoveryResult.id,
        address: discoveryResult.address,
      });
    });

    this._onDiscoveryResult({
      id: discoveryResult.id,
      address: discoveryResult.address,
    });
  }

  _onDiscoveryResult({
    id,
    address,
  }) {
    if (this.bridges.has(id)) {
      this.homey.log(`[HueDiscovery] Re-Discovered ${id} at ${address}`);
      const bridge = this.bridges.get(id);
      if (bridge.address !== address) {
        bridge.address = address;
        this.homey.app.log(`[${bridge.id}]`, `Address changed to ${address}`);
      }
    } else {
      this.homey.log(`[HueDiscovery] Discovered ${id} at ${address}`);
      const bridge = new HueBridgeLocal({
        id,
        address,
        homey: this.homey,
      });

      bridge.init().then(() => {
        this.bridges.set(id, bridge);
        this.emit(`bridge:${id}`, bridge);
        this.homey.app.log(`Bridge Inited: ${bridge.id} - ${bridge.address} - Authenticated: ${!!bridge.username}`);
      }).catch(err => this.homey.app.error('[HueDiscovery]', `[${bridge.id}]`, err.message || err.toString()));
    }
  }

  enableDiscovery() {
    if (this.discoveryEnabled) return;

    this.homey.log('Enabling discovery...');
    this.discoveryEnabled = true;
    this.discover();
  }

  disableDiscovery() {
    if (!this.discoveryEnabled) return;

    this.homey.log('Disabling discovery...');
    this.discoveryEnabled = false;
  }

  discover() {
    if (!this.discoveryEnabled) return;

    Promise.resolve().then(async () => {
      const res = await fetch(HueDiscovery.NUPNP_URL, {
        headers: {
          'User-Agent': `Homey/${this.homey.version} nl.philips.hue/${this.homey.app.manifest.version}`,
        },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const body = await res.json();

      if (!Array.isArray(body)) {
        throw new Error('Body Is Not An Array');
      }

      body.forEach(({ id, internalipaddress: address }) => {
        if (typeof id !== 'string') return;
        if (typeof address !== 'string') return;

        id = id.toLowerCase();

        this._onDiscoveryResult({
          id,
          address,
        });
      });
    }).catch(err => this.homey.app.error('[HueDiscovery]', err.message || err.toString()));
  }

  getBridges() {
    return this.bridges;
  }

  getBridge(id) {
    if (!this.bridges.has(id)) {
      throw new HueError('Bridge Not Found');
    }

    return this.bridges.get(id);
  }

  async getBridgeAsync(id) {
    if (this.bridges.has(id)) {
      return this.bridges.get(id);
    }

    return new Promise(resolve => {
      this.once(`bridge:${id}`, resolve);
    });
  }

};
