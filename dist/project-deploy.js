'use strict';

var getAddresses = require('./get-addresses-ca571639.js');
var inquirer = require('inquirer');
var utils = require('./utils.js');
var dotenv = require('dotenv');
var path = require('path');
var ethers = require('ethers');
require('fs');
require('solc');
require('util');
require('ora');
require('globby');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var inquirer__default = /*#__PURE__*/_interopDefaultLegacy(inquirer);
var dotenv__default = /*#__PURE__*/_interopDefaultLegacy(dotenv);

const dotenvConfig = dotenv__default["default"].config().parsed;
const { prompt } = inquirer__default["default"];

var projectDeploy = async (source, params = [], network) => {
  const logger = await utils.getLogger();
  const config = await getAddresses.getConfig();

  const provider = new ethers.providers.JsonRpcProvider(
    config.networks[network].rpcUrl,
    {
      chainId: config.networks[network].chainId
    }
  );

  if (!dotenvConfig[`${network}_PRIVATE_KEY`]) throw new Error(`No key found in .env for ${network}_PRIVATE_KEY`)

  const signer = new ethers.Wallet(dotenvConfig[`${network}_PRIVATE_KEY`], provider);

  const addresses = await getAddresses.getAddresses(config.addressesPath, network);
  config.solc;
  const contractPaths = await getAddresses.getContract(source);
  // for (const path of Object.keys(contractPaths)) {
    globalThis.deployable = true;
    logger.info(`compiling ${source}`);
    const dependencies = await getAddresses.getDependencies(contractPaths[source].content, logger);
    let contract = await getAddresses.compile(contractPaths, dependencies, config, config.solc, logger);
    if (globalThis.deployable === true) {
      const contractName = contract.contractName;
      if (addresses[contract.contractName]) {
        const answers = await prompt({
          type: 'confirm',
          name: 'deploy',
          default: false,
          message: `redeploy ${contract.contractName}?`
        });
        if (answers.deploy) {
          contract = await getAddresses.deploy(contract, params, signer, logger);
        }
      } else {
        contract = await getAddresses.deploy(contract, params, signer, logger);
      }
console.log(addresses);
      addresses[contractName] = contract.address;
      await utils.write(path.join(config.addressesPath, `${network}.json`), JSON.stringify(addresses, null, 2));
    }
  // }
return contract
  // await deploy(contractPaths, config)
};

module.exports = projectDeploy;
