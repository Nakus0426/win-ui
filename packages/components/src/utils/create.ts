import { isArray } from 'lodash-es'

type ClassName = string | undefined | null
type Classes = (ClassName | [any, ClassName, ClassName?])[]

export function createNamespace(name: string) {
	const namespace = 'win'
	const componentName = `${namespace}-${name}`

	function createBEM(suffix?: string) {
		if (!suffix) return componentName
		if (suffix[0] === '$') return suffix.replace('$', namespace)
		return suffix[0] === '-' && suffix[1] === '-' ? `${componentName}${suffix}` : `${componentName}__${suffix}`
	}

	function createClasses(...classes: Classes): any[] {
		return classes.map((className) => {
			if (isArray(className)) {
				const [condition, truthy, falsy = null] = className
				return condition ? truthy : falsy
			}
			return className
		})
	}

	return {
		bem: createBEM,
		classes: createClasses,
	}
}
