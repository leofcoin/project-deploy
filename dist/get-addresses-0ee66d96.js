'use strict';

var utils = require('./utils.js');
var path = require('path');
var fs = require('fs');
var globby = require('globby');
var solc = require('solc');
var ethers = require('ethers');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var solc__default = /*#__PURE__*/_interopDefaultLegacy(solc);

const get = async path => {
  const file = await utils.read(path);
  return JSON.parse(file)
};

const buildPath = path.join(process.cwd(), 'build');

const defaultConfig = {
  buildPath,
  abiPath: path.join(buildPath, 'abis'),
  flatsPath: path.join(buildPath, 'flats'),
  addressesPath: path.join(buildPath, 'addresses'),
  bytecodePath: path.join(buildPath, 'bytecodes'),
  autoFix: true,
  license: 'MIT',
  networks: {
    'binance-smartchain-testnet': {
      rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97
    },
    'binance-smartchain': {
      rpcUrl: 'https://bsc-dataseed.binance.org',
      chainId: 56
    }
  },
  defaultNetwork: 'binance-smartchain-testnet'
};

var getConfig = async (config = {}) => {
  const paths = await globby.globby(['project-deploy.config.*']);

  if (paths.length > 0) config = paths[0].includes('.json') && await get(paths[0]);

  config = {...defaultConfig, ...config};

  try {
    fs.mkdirSync(config.abiPath);
  } catch (e) {
  }
  try {
    fs.mkdirSync(config.buildPath);
  } catch (e) {
  }
  try {
    fs.mkdirSync(config.flatsPath);
  } catch (e) {

  }
  try {
    fs.mkdirSync(config.addressesPath);
  } catch (e) {

  }
  try {
    fs.mkdirSync(config.bytecodePath);
  } catch (e) {

  }
  return config
};

var getContract = async (path) => {
  const content = await utils.read(path);
  const sources = {};
  sources[path] = { content: content.toString() };
  return sources
};

var addLicence = async (license, path, logger) => {
  const data = await utils.read(path);
  await utils.write(path, `// SPDX-License-Identifier: ${license}
${data.toString()}`);

  logger.info(`adding License ${license}; to ${path}`);
};

var addPragmaVersion = async (version, path, logger) => {
  const data = await utils.read(path);
  await utils.write(path, `pragma solidity ${version};
${data.toString()}`);

  logger.info(`adding pragma solidity version ${version} for ${path}`);
};

var setPragmaVersion = async (version, path, logger) => {
  let data = await utils.read(path);
  data = data.toString();

  await utils.write(path, data.replace(/pragma solidity (.*);/g, `pragma solidity ${version};`));
  logger.info(`updating pragma solidity version to ${version} for ${path}`);
};

var compile = async (sources, dependencies, config, solcConfig, logger) => {
  const input = {
    language: 'Solidity',
    sources: {...sources, ...dependencies },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'metadata', 'evm.bytecode']
        }
      }
    }
  };

  let output = solc__default["default"].compile(JSON.stringify(input), {cwd: process.cwd()});
  output = JSON.parse(output);

  if (output.errors) {
      globalThis.deployable = false;
      for (const error of output.errors) {
        try {
          const {errorCode, sourceLocation, type, formattedMessage} = error;
          if (type === 'Error') return logger.fail(error);
          if (errorCode === '1878') config.autoFix && config.license && await addLicence(config.license, sourceLocation.file, logger);
          else if (errorCode === '3420') config.autoFix && await addPragmaVersion(solc__default["default"].semver().split('+')[0], sourceLocation.file, logger);
          else if (errorCode === '5333') config.autoFix && await setPragmaVersion(solc__default["default"].semver().split('+')[0], sourceLocation.file, logger);
          else logger.fail(`${type}: ${formattedMessage}`);

          if (!config.autoFix) {
            logger.info(`${errorCode}: ${formattedMessage}`);
          } else {
            logger.info(`undeployable! fixes have been applied, rerun to deploy`);
          }
        } catch (e) {
          globalThis.deployable = false;
          logger.fail(JSON.stringify(e));
        }
      }
      delete output.errors;
  }
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
  let flat = '';
  let _contract = {};
    try {
      logger.info(`updating abis`);
      for (const path$1 of Object.keys(output.contracts).reverse()) {
       const contract = output.contracts[path$1];
       for (const contractName of Object.keys(contract)) {

         if (contract[contractName].abi.length > 0) {
           await utils.write(path.join(config.abiPath, `${contractName}.json`), JSON.stringify(contract[contractName].abi, null, 2));
         }

         if (sources[path$1]) {
           flat += sources[path$1].content.replace(/pragma solidity (.*);/g, '').replace(/\/\/ SPDX-License-Identifier\: (.*)/g, '');
           flat = flat.replace(/import \'(.*)+\w\.(sol)\'\;|import \"(.*)+\w\.(sol)\"\;/g, '');

           logger.info(`updating flat`);
           await utils.write(path.join(config.flatsPath, `${contractName}.sol`), flat);

           await utils.write(path.join(config.bytecodePath, `${contractName}.json`), JSON.stringify(contract[contractName].evm.bytecode.object, null, 2));

           const size = formatBytes((contract[contractName].evm.bytecode.object.length - 2) / 2, 2);
           logger.info(`size: ${size}`);
           _contract.abi = contract[contractName].abi;
           _contract.contractName = contractName;
           _contract.bytecode = contract[contractName].evm.bytecode.object;
         }

         if (dependencies[path$1]) {
           if (Object.keys(dependencies).indexOf(dependencies[path$1]) !== 0) {
             flat += dependencies[path$1].content.replace(/pragma solidity (.*);/g, '').replace(/\/\/ SPDX-License-Identifier\: (.*)/g, '');
           } else {
             flat += dependencies[path$1].content;
           }
         }
       }
     }
    } catch (e) {
      logger.fail(e.message);
    }

    return _contract
};

var deploy = async ({ contractName, abi, bytecode }, params = [], signer, logger) => {
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(...params, { gasLimit: 21000000 });
  await contract.deployTransaction.wait();
  logger.info(`deployed ${contractName} as ${contract.address}`);
  return contract
};

const { join, relative, resolve, dirname, normalize, toNamespacedPath, isAbsolute, parse } = path.win32;


var getDependencies = async (sources, logger) => {
  const getImports = async (content, set = {}, root = process.cwd()) => {
    const matches = content.match(/import \'(.*)+\w\.(sol)\'|import \"(.*)+\w\.(sol)\"/g);
    if (matches)
      for (const match of matches) {
        try {
          let path = match.split('import ')[1].replace(/\'|\"/g, '');
          if (path.includes('node_modules')) {
            path = path.split('node_modules');
            path = join('node_modules', path[1]);
          }

          path = join(root, path);

          let relativePath = path;
          relativePath = relativePath.split('node_modules');
          relativePath = join('node_modules', relativePath[1]).replace(/\\/g, '\/');
          const data = await utils.read(path);
          set[relativePath] = {
            content: data.toString()
          };

          if (set[relativePath].content.includes('import')) set = await getImports(set[relativePath].content, set, path.includes('node_modules') ? dirname(path) : process.cwd());

        } catch (e) {
          logger.fail(e);
        }
      }

    return set
  };

  return getImports(sources, {})
};

var getAddresses = async (path$1, network) => {
  let addresses;
  try {
    addresses = await utils.read(path.join(path$1, `${network}.json`));
    addresses = JSON.parse(addresses.toString());
  } catch (e) {
    addresses = [];
  }
  return addresses
};

exports.compile = compile;
exports.deploy = deploy;
exports.getAddresses = getAddresses;
exports.getConfig = getConfig;
exports.getContract = getContract;
exports.getDependencies = getDependencies;
