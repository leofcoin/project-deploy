#project-deploy

## install
### cli usage
```sh
npm i -g @leofcoin/project-deploy
```

### module usage
```sh
npm i --save @leofcoin/project-deploy
```
## examples
### config
project-deploy.config.json
```json
{
  "deploy": {
    "contracts/TestContract.sol": ["0x4eCfe05bAe2535f13a92A16E60Be1b68BdEDEDb7"]
  },
  "autoFix": true,
  "license": "MIT",
  "networks": {
    "binance-smartchain-testnet": {
      "rpcUrl": "https://data-seed-prebsc-1-s1.binance.org:8545",
      "chainId": 97
    },
    "binance-smartchain": {
      "rpcUrl": "https://bsc-dataseed.binance.org",
      "chainId": 56
    },
    "goerli": {
      "rpcUrl": "https://goerli.prylabs.net",
      "chainId": "5"
    }
  }
}
```

### .env
```
binance-smartchain-testnet_PRIVATE_KEY="...."
goerli_PRIVATE_KEY="...."
```

### secure-securenv
```
npx secure-env .env -s mySecretPassword
```

#### using config file in project folder and cli (with secure-env)
Checkout [secure-env](https://www.npmjs.com/package/secure-env) to learn more
```sh
project-deploy --network goerli --secret mySecretPassword
```

#### using config file in project folder and cli (without secure-env)
Fallsback to dotenv
```sh
project-deploy --network goerli
```


#### using config file in project and module deployment for more advanced setups

```js
import deploy from 'project-deploy.js';

const testContract = await deploy('contracts/TestContract.sol', ["0x4eCfe05bAe2535f13a92A16E60Be1b68BdEDEDb7"], 'goerli', 'mySecretPassword')

const anotherContract = await deploy('contracts/AnotherContract.sol', [testContract.address], 'goerli', 'mySecretPassword')
```
