import { beforeEach, expect, test } from 'vitest'

import { HoudiniClient } from '.'
import { setMockConfig } from '../lib/config'
import { ArtifactKind } from '../lib/types'
import { ClientPlugin, DocumentObserver } from './documentObserver'

export class History {
	constructor() {
		this.history = []
	}

	private history: [number, string][] = []

	public add = (which: number, step: string) => {
		this.history.push([which, step])
	}

	public reset = () => {
		this.history = []
	}

	public get = () => {
		return this.history
	}
}

export function createStore(
	plugins: ClientPlugin[],
	enableCaching = false
): DocumentObserver<any, any> {
	return new HoudiniClient({
		url: 'URL',
		pipeline() {
			return plugins
		},
	}).observe({
		artifact: {
			kind: ArtifactKind.Query,
			hash: '1234',
			raw: 'RAW_TEXT',
			name: 'TestArtifact',
			rootType: 'Query',
			selection: {
				fields: {
					foo: { type: 'string', keyRaw: 'foo' },
				},
			},
			input: {
				types: {},
				fields: {
					date1: 'Date',
					date2: 'Date',
				},
			},
		},
		// turn off the cache since we aren't pushing actual graphql documents through by default
		cache: enableCaching,
	})
}

export type ClientPluginTest = (config: {
	history?: History
	data?: any
	errors?: any[]
}) => () => ReturnType<ClientPlugin>

export const terminate: ClientPluginTest =
	({ history = new History(), data = { foo: 'bar' }, errors = [] }) =>
	() => ({
		setup: {
			enter(ctx, { next }) {
				history.add(99, 'one_enter')
				next(ctx)
			},
			exit(ctx, { resolve }) {
				history.add(99, 'one_exit')
				resolve(ctx)
			},
		},
		network: {
			enter(ctx, { resolve }) {
				history.add(99, 'two_enter')
				resolve(ctx, { result: { data, errors } })
			},
			exit(ctx, { resolve }) {
				history.add(99, 'two_enter')
				resolve(ctx)
			},
		},
	})

// prepare tests for this file
let history = new History()
beforeEach(() => {
	history.reset()
	setMockConfig({})
})

test('createStore & terminate', async function () {
	// data that will be returned from the network
	const data = { foo: 'bar' }

	// create the client with the middlewares
	const ret = await createStore([terminate({ history, data })]).send({})

	expect(history.get()).toEqual([
		[99, 'one_enter'],
		[99, 'two_enter'],
		[99, 'two_enter'],
		[99, 'one_exit'],
	])

	// check that result is correct
	expect(ret.result.data).toBe(data)
})
