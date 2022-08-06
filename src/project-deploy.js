
import { getConfig, getContract, getDependencies, getAddresses, compile, deploy } from './tasks/tasks.js'
import inquirer from 'inquirer'
import { getLogger, write } from './utils.js'
import dotenv from 'dotenv'
import { join } from 'path'
import { providers, Wallet} from 'ethers'
const { prompt } = inquirer
import secureEnv from 'secure-env'
import {findLinkReferences} from 'solc/linker'

export default async (source, params = [], libraries = [], network, secret) => {
  const logger = await getLogger()
  const config = await getConfig()

  const dotenvConfig = secret ? secureEnv({secret}) : dotenv.config().parsed

  if (!network && config.network) network = config.defaultNetwork

  const provider = new providers.JsonRpcProvider(
    config.networks[network].rpcUrl,
    {
      chainId: config.networks[network].chainId
    }
  )

  if (!secret && !dotenvConfig[`${network}_PRIVATE_KEY`]) throw new Error(`No key found in .env for ${network}_PRIVATE_KEY`)
  if (secret && !dotenvConfig[`${network}_PRIVATE_KEY`]) throw new Error(`No key found in .env for ${network}_PRIVATE_KEY`)

  const signer = new Wallet(dotenvConfig[`${network}_PRIVATE_KEY`], provider)

  const addresses = await getAddresses(config.addressesPath, network)
  const contractPaths = await getContract(source, logger)
  // for (const path of Object.keys(contractPaths)) {
    globalThis.deployable = true
    logger.info(`compiling ${source}`)
    const dependencies = await getDependencies(contractPaths[source].content, source, logger)
    let contract = await compile(contractPaths, dependencies, config, logger)
    if (globalThis.deployable === true) {
      const contractName = contract.contractName
      const references = findLinkReferences(contract.bytecode)
      let i = 0
      for (const ref of Object.keys(references)) {
        contract.bytecode = contract.bytecode.replace(`__${ref}__`, libraries[i].replace('0x', ''))
        i++
      }
      // if (libraries) contract.bytecode = linkBytecode(contract.bytecode, _references)
      if (addresses[contract.contractName]) {
        const answers = await prompt({
          type: 'confirm',
          name: 'deploy',
          default: false,
          message: `redeploy ${contract.contractName}?`
        })
        if (answers.deploy) {
          contract = await deploy(contract, params, signer, logger)
        }
      } else {
        contract = await deploy(contract, params, signer, logger)
      }

      if (!contract.address) contract.address = addresses[contractName]
      else addresses[contractName] = contract.address
      await write(join(config.addressesPath, `${network}.json`), JSON.stringify(addresses, null, 2))
    }
  // }
  return contract?.signer ? contract : { signer }
}
