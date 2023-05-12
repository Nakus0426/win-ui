import { join } from 'node:path'
import { camelCase, upperFirst } from 'lodash-es'
import { SRC_DIR, getPackageJson } from '../common/constant.js'
import { getComponents, normalizePath, smartOutputFile } from '../common/index.js'

type PathResolver = (path: string) => string

function getPathByName(name: string, pathResolver?: PathResolver) {
	let path = join(SRC_DIR, name)
	if (pathResolver) path = pathResolver(path)
	return normalizePath(path)
}

function genImports(names: string[], pathResolver?: PathResolver): string {
	return names
		.map((name) => {
			const importName = upperFirst(camelCase(name))
			const importPath = getPathByName(name, pathResolver)
			return `import ${importName} from '${importPath}';`
		})
		.join('\n')
}

function genExports(names: string[], pathResolver?: PathResolver): string {
	const exports = names.map((name) => `export * from '${getPathByName(name, pathResolver)}';`).join('\n')

	return `
export {
  install,
  version,
};
${exports}`
}

export function genPackageEntry(outputPath: string, pathResolver?: PathResolver) {
	const names = getComponents()
	const version = process.env.PACKAGE_VERSION || getPackageJson().version
	const components = names.map((name) => upperFirst(camelCase(name)))

	const content = `${genImports(names, pathResolver)}

const version = '${version}';
  
function install(app) {
  const components = [
    ${components.join(',\n    ')}
  ];

  components.forEach(item => {
    if (item.install) {
      app.use(item);
    } else if (item.name) {
      app.component(item.name, item);
    }
  });
}

${genExports(names, pathResolver)}

export default {
  install,
  version
};`

	smartOutputFile(outputPath, content)
}
