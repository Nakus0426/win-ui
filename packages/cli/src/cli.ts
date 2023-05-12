import { Command } from 'commander'
import { cliVersion } from './index.js'

const program = new Command()

program.version(`@win-ui/cli ${cliVersion}`)

program
	.command('build')
	.description('Compile components in production mode')
	.action(async () => {
		const { build } = await import('./commands/build.js')
		return build()
	})

program.parse()
