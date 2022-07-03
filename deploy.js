const deploy = require('./')

const network = 'goerli';

(async (deployer) => {
  const library = await deploy('contracts/TestLibrary.sol', undefined, undefined, network, 'mySecretPassword')
  const result = await deploy('contracts/TestContract.sol', ['0x4eCfe05bAe2535f13a92A16E60Be1b68BdEDEDb7'], [library.address], network, 'mySecretPassword')
})()
