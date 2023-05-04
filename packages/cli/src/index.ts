import { fileURLToPath } from 'node:url'
import fe from 'fs-extra'

const packagePath = fileURLToPath(new URL('../package.json', import.meta.url))
const packageJson = JSON.parse(fe.readFileSync(packagePath, 'utf-8'))
export const cliVersion: string = packageJson.version

process.env.CLI_VERSION = cliVersion
