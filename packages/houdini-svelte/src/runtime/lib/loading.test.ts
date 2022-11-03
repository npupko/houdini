import type { SubscriptionSelection } from 'houdini'
import { describe, expect, test } from 'vitest'

import { loadingStateForSelection, LoadingValue } from './loading'

describe('loading state for selection', function () {
	test('fields', function () {
		const selection: SubscriptionSelection = {
			firstName: {
				type: 'String',
				keyRaw: 'firstName',
			},
			lastName: {
				type: 'String',
				keyRaw: 'lastName',
			},
		}

		expect(loadingStateForSelection(selection)).toEqual({
			firstName: LoadingValue,
			lastName: LoadingValue,
		})
	})

	test('nested objects', function () {
		const selection: SubscriptionSelection = {
			viewer: {
				type: 'User',
				keyRaw: 'viewer',
				fields: {
					parent: {
						type: 'User',
						keyRaw: 'parent',
						fields: {
							firstName: {
								type: 'String',
								keyRaw: 'firstName',
							},
							lastName: {
								type: 'String',
								keyRaw: 'lastName',
							},
						},
					},
				},
			},
		}

		expect(loadingStateForSelection(selection)).toEqual({
			viewer: {
				parent: {
					firstName: LoadingValue,
					lastName: LoadingValue,
				},
			},
		})
	})

	test('default list', function () {
		const selection: SubscriptionSelection = {
			viewer: {
				type: 'User',
				keyRaw: 'viewer',
				fields: {
					parents: {
						type: 'User',
						keyRaw: 'parents',
						listInfo: {
							nullableElement: false,
						},
						fields: {
							firstName: {
								type: 'String',
								keyRaw: 'firstName',
							},
							lastName: {
								type: 'String',
								keyRaw: 'lastName',
							},
						},
					},
				},
			},
		}

		expect(loadingStateForSelection(selection)).toEqual({
			viewer: {
				parents: [
					{
						firstName: LoadingValue,
						lastName: LoadingValue,
					},
				],
			},
		})
	})
})
