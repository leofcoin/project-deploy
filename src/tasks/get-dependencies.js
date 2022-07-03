import {win32} from 'path'
import { glob, read, getLogger } from './../utils.js'
const { join, relative, resolve, dirname, normalize, toNamespacedPath, isAbsolute, parse } = win32


export default async (sources, sourcePath, logger) => {
  const getImports = async (content, set = {}, root = process.cwd()) => {
    const matches = content.match(/import \'(.*)+\w\.(sol)\'|import \"(.*)+\w\.(sol)\"/g)
    if (matches)
      for (const match of matches) {
        try {
          let path = match.split('import ')[1].replace(/\'|\"/g, '')
          const importPath = path
          if (path.includes('node_modules')) {
            path = path.split('node_modules')
            path = join('node_modules', path[1])
          }

          path = join(root, path)
          let relativePath = path
          relativePath = relativePath.split('node_modules')
          if (relativePath.length === 1) {
            path = join(parse(sourcePath).dir, importPath)
            relativePath = path.split(process.cwd())[0].replace(/\\/g, '\/')
          } else relativePath = join('node_modules', relativePath[1]).replace(/\\/g, '\/')
          const data = await read(path)
          set[relativePath] = {
            content: data.toString()
          }
          if (set[relativePath].content.includes('import')) set = await getImports(set[relativePath].content, set, path.includes('node_modules') ? dirname(path) : process.cwd())

        } catch (e) {
          logger.fail(e);
        }
      }

    return set
  }

  return getImports(sources, {})
}
