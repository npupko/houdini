import type { SubscriptionSelection } from 'houdini'

// QUESTIONS:
// global opt-in (default false)
// use symbol as value instead of undefined?
// how to maintain typesafety?
//   - when opt-in, type generation needs to make every field `| LoadingValue`

export function loadingStateForSelection<_Data extends {}>(
	selection: SubscriptionSelection
): _Data {
	// we just need to turn the selection into an object of its fields
	return Object.fromEntries(
		Object.entries(selection).map(([fieldName, selection]) => {
			// if the value has no subselection, we're done
			if (!selection.fields) {
				return [fieldName, LoadingValue]
			}

			// if this field isn't a list, just keep going
			if (!selection.listInfo) {
				return [fieldName, loadingStateForSelection(selection.fields)]
			}

			// create the correct number of elements in the list
			let loadingCount = 1
			return [
				fieldName,
				Array.from({ length: loadingCount }).map(() =>
					loadingStateForSelection(selection.fields!)
				),
			]
		})
	) as _Data
}

export let LoadingValue = Symbol('houdini-loading-value')
