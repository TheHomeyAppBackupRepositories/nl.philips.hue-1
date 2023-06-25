'use strict';

const HueError = require('./HueError');

module.exports = class HueErrorNotImplemented extends HueError {

  constructor() {
    super('Not Implemented');
  }

};
