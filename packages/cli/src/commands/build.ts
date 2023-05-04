import { join, relative } from 'node:path'
import { consola } from 'consola'
import fe from 'fs-extra'
import { execa } from 'execa'
import type { Format } from 'esbuild'
import { createSpinner } from 'nanospinner'
import { isAsset, isDemoDir, isDir, isScript, isSfc, isStyle, isTestDir, setBuildTarget, setModuleEnv, setNodeEnv } from '../common/index.js'
import { CSS_LANG, ES_DIR, LIB_DIR, SRC_DIR } from '../common/constant.js'
import { genStyleDepsMap } from '../compiler/gen-style-deps-map.js'
import { genComponentStyle } from '../compiler/gen-component-style.js'
import { genPackageStyle } from '../compiler/gen-package-style.js'
import { compileSfc } from '../compiler/compile-sfc.js'
import { compileStyle } from '../compiler/compile-style.js'
import { compileScript } from '../compiler/compile-script.js'
import { genPackageEntry } from '../compiler/gen-package-entry.js'
import { compileBundles } from '../compiler/compile-bundles.js'

async function preCompileDir(dir: string) {
  const files = await fe.readdir(dir)
  await Promise.all(
    files.map((filename) => {
      const filePath = join(dir, filename)
      if (isDemoDir(filePath) || isTestDir(filePath))
        return fe.remove(filePath)
      if (isDir(filePath))
        return preCompileDir(filePath)
      if (isSfc(filePath))
        return compileSfc(filePath)
      return Promise.resolve()
    }),
  )
}

async function compileFile(filePath: string, format: Format) {
  if (isScript(filePath))
    return compileScript(filePath, format)
  if (isStyle(filePath))
    return compileStyle(filePath)
  if (isAsset(filePath))
    return Promise.resolve()
  return fe.remove(filePath)
}

async function compileDir(dir: string, format: Format) {
  const files = await fe.readdir(dir)
  await Promise.all(
    files.map((filename) => {
      const filePath = join(dir, filename)
      return isDir(filePath)
        ? compileDir(filePath, format)
        : compileFile(filePath, format)
    }),
  )
}

async function clean() {
  consola.info('Clean')
  await Promise.all([fe.remove(ES_DIR), fe.remove(LIB_DIR)])
}

async function installDependencies() {
  consola.info('Install Dependencies')
  try {
    await execa('pnpm', ['install', '--prod=false'], { stdio: 'inherit' })
  }
  catch (err) {
    consola.log(err)
    throw err
  }
}

async function copySourceCode() {
  return Promise.all([fe.copy(SRC_DIR, ES_DIR), fe.copy(SRC_DIR, LIB_DIR)])
}

async function buildPackageScriptEntry() {
  const esEntryFile = join(ES_DIR, 'index.js')
  const libEntryFile = join(LIB_DIR, 'index.js')
  genPackageEntry(esEntryFile, (path: string) => `./${relative(SRC_DIR, path)}`)
  await fe.copy(esEntryFile, libEntryFile)
}

async function buildStyleEntry() {
  await genStyleDepsMap()
  genComponentStyle()
}

function buildPackageStyleEntry() {
  const styleEntryFile = join(LIB_DIR, `index.${CSS_LANG}`)
  genPackageStyle(styleEntryFile, (path: string) => path.replace(SRC_DIR, '.'))
}

async function buildTypeDeclarations() {
  await Promise.all([preCompileDir(ES_DIR), preCompileDir(LIB_DIR)])
  const tsConfig = join(process.cwd(), 'tsconfig.declaration.json')
  if (fe.existsSync(tsConfig))
    await execa('tsc', ['-p', tsConfig], { stdout: 'inherit', stderr: 'inherit' })
}

async function buildESMOutputs() {
  setModuleEnv('esmodule')
  setBuildTarget('package')
  await compileDir(ES_DIR, 'esm')
}

async function buildCJSOutputs() {
  setModuleEnv('commonjs')
  setBuildTarget('package')
  await compileDir(LIB_DIR, 'cjs')
}

async function buildBundledOutputs() {
  setModuleEnv('esmodule')
  await compileBundles()
  // genWebStormTypes(config.build?.tagPrefix)
}

const tasks = [
  {
    name: 'Copy Source Code',
    task: copySourceCode,
  },
  {
    text: 'Build Package Script Entry',
    task: buildPackageScriptEntry,
  },
  {
    text: 'Build Component Style Entry',
    task: buildStyleEntry,
  },
  {
    text: 'Build Package Style Entry',
    task: buildPackageStyleEntry,
  },
  {
    text: 'Build Type Declarations',
    task: buildTypeDeclarations,
  },
  {
    text: 'Build ESModule Outputs',
    task: buildESMOutputs,
  },
  {
    text: 'Build CommonJS Outputs',
    task: buildCJSOutputs,
  },
  // {
  //   text: 'Build Bundled Outputs',
  //   task: buildBundledOutputs,
  // },
]

async function runBuildTasks() {
  for (let i = 0; i < tasks.length; i++) {
    const { task, text } = tasks[i]
    const spinner = createSpinner(text).start()
    try {
      await task()
      spinner.success({ text })
    }
    catch (err) {
      spinner.error({ text })
      consola.log(err)
      throw err
    }
  }

  consola.success('Compile successfully')
}

export async function build() {
  setNodeEnv('production')
  try {
    await clean()
    await installDependencies()
    await runBuildTasks()
  }
  catch (err) {
    consola.error('Build failed')
    process.exit(1)
  }
}
