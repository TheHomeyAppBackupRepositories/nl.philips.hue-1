'use strict';

const HueError = require('./HueError');

module.exports = class HueErrorOverloadMe extends HueError {

  constructor() {
    super('Overload Me');
  }

};
