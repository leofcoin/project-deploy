import { writeFile, readFile } from 'fs'
import { promisify } from 'util'
import ora from 'ora'
import globby from 'globby'

export const write = promisify(writeFile)
export const read = promisify(readFile)
export const glob = globby
export const getLogger = () => {
  if (!globalThis.logger) globalThis.logger = ora('Project deploy').start()

  return logger
}
