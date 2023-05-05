import { join } from 'node:path'
import glob from 'fast-glob'
import fe from 'fs-extra'
import { LIB_DIR, PACKAGE_NAME, SRC_DIR, TAG_PREFIX_NAME, getPackageJson } from '../../common/constant.js'
import { normalizePath } from '../../common/index.js'
import type { Options, VueTag } from './types.js'
import { mdParser } from './parser.js'
import { formatter } from './formatter.js'

async function readMarkdown(options: Options) {
  const mds = await glob(normalizePath(`${options.path}/**/*.md`))
  return mds
    .filter(md => options.test.test(md))
    .map(path => fe.readFileSync(path, 'utf-8'))
}

function genWebTypes(tags: VueTag[], options: Options) {
  return {
    '$schema':
      'https://raw.githubusercontent.com/JetBrains/web-types/master/schema/web-types.json',
    'framework': 'vue',
    'name': options.name,
    'version': options.version,
    'contributions': {
      html: {
        tags,
        attributes: [],
      },
    },
    'js-types-syntax': 'typescript',
  }
}

export async function parseAndWrite(options: Options) {
  if (!options.outputDir)
    throw new Error('outputDir can not be empty.')
  const mds = await readMarkdown(options)
  const vueTags: VueTag[] = []
  mds.forEach((md) => {
    const parsedMd = mdParser(md)
    formatter(vueTags, parsedMd, options.tagPrefix)
  })
  const webTypes = genWebTypes(vueTags, options)
  fe.outputFileSync(join(options.outputDir, 'web-types.json'), JSON.stringify(webTypes))
}

export function genWebStormTypes() {
  const pkgJson = getPackageJson()
  parseAndWrite({
    name: PACKAGE_NAME,
    path: SRC_DIR,
    test: /README\.md/,
    version: pkgJson.version,
    outputDir: LIB_DIR,
    tagPrefix: TAG_PREFIX_NAME,
  })
}
