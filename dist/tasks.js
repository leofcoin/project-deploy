'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var getAddresses = require('./get-addresses-ca571639.js');
require('./utils.js');
require('fs');
require('util');
require('ora');
require('globby');
require('path');
require('solc');
require('ethers');



exports.compile = getAddresses.compile;
exports.deploy = getAddresses.deploy;
exports.getAddresses = getAddresses.getAddresses;
exports.getConfig = getAddresses.getConfig;
exports.getContract = getAddresses.getContract;
exports.getDependencies = getAddresses.getDependencies;
