#!/usr/bin/env node
const { getConfig } = require('./../dist/tasks.js')
const { getLogger } = require('./../dist/utils.js')
const deploy = require('./../dist/project-deploy.js');

(async () => {
  let network
  let secret
  for (const arg of process.argv) {
    if (arg === '--network') network = process.argv[process.argv.indexOf(arg) + 1]
    if (arg === '--secret') secret = process.argv[process.argv.indexOf(arg) + 1]
  }
  const config = await getConfig()
  if (!config.deploy) return console.log(`no config file found, ensure you have a project-deploy.config.json in your project directory`);

  for (const deployment of Object.keys(config.deploy)) {

    try {
      await deploy(deployment, config.deploy[deployment], config.deploy[deployment].libraries, network, secret)
    } catch (e) {
      getLogger().fail(e.message)
    }
  }
})()
