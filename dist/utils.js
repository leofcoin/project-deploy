'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var util = require('util');
var ora = require('ora');
var globby = require('globby');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var ora__default = /*#__PURE__*/_interopDefaultLegacy(ora);
var globby__default = /*#__PURE__*/_interopDefaultLegacy(globby);

const write = util.promisify(fs.writeFile);
const read = util.promisify(fs.readFile);
const glob = globby__default["default"];
const getLogger = () => {
  if (!globalThis.logger) globalThis.logger = ora__default["default"]('Project deploy').start();

  return logger
};

exports.getLogger = getLogger;
exports.glob = glob;
exports.read = read;
exports.write = write;
