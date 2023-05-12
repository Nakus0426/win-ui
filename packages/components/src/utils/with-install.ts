import { kebabCase } from 'lodash-es'
import type { App, Component } from 'vue'

interface EventShim {
	new (...args: any[]): {
		$props: {
			onClick?: (...args: any[]) => void
		}
	}
}

export type WithInstall<T> = T & { install(app: App): void } & EventShim

export function withInstall<T extends Component>(options: T) {
	;(options as Record<string, unknown>).install = (app: App) => {
		const { name } = options
		if (name) {
			app.component(name, options)
			app.component(kebabCase(name), options)
		}
	}
	return options as WithInstall<T>
}
