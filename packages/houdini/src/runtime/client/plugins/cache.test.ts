import { beforeEach, expect, test, vi } from 'vitest'

import { HoudiniClient } from '..'
import { testConfigFile } from '../../../test'
import { Cache } from '../../cache/cache'
import { CachePolicy } from '../../lib'
import { setMockConfig } from '../../lib/config'
import { ArtifactKind, DataSource, GraphQLObject, QueryResult } from '../../lib/types'
import { ClientPlugin, DocumentObserver } from './../documentObserver'
import { cachePolicyPlugin } from './cache'

/**
 * Utilities for testing the cache plugin
 */
export function createStore(plugins: ClientPlugin[]): DocumentObserver<any, any> {
	return new HoudiniClient({
		url: 'URL',
		pipeline() {
			return plugins
		},
	}).observe({
		artifact: {
			kind: ArtifactKind.Query,
			hash: '7777',
			raw: 'RAW_TEXT',
			name: 'TestArtifact',
			rootType: 'Query',
			selection: {
				fields: {
					viewer: {
						type: 'User',
						keyRaw: 'viewer',
						selection: {
							fields: {
								id: {
									type: 'ID',
									keyRaw: 'id',
								},
								firstName: {
									type: 'String',
									keyRaw: 'firstName',
								},
							},
						},
					},
				},
			},
		},
		cache: true,
	})
}

export type ClientPluginTest = (config: {
	result?: QueryResult<GraphQLObject, Record<string, any>>
}) => () => ReturnType<ClientPlugin>

export const fakeFetch: ClientPluginTest =
	({
		result = {
			data: {
				viewer: {
					id: '1',
					firstName: 'bob',
				},
			},
			errors: [],
			fetching: false,
			variables: null,
			source: DataSource.Network,
			partial: false,
		},
	}) =>
	() => ({
		setup: {
			enter(ctx, { next }) {
				next(ctx)
			},
			exit(ctx, { resolve }) {
				resolve(ctx)
			},
		},
		network: {
			enter(ctx, { resolve }) {
				resolve(ctx, { ...result })
			},
			exit(ctx, { resolve }) {
				resolve(ctx)
			},
		},
	})

/**
 * Testing the cache plugin
 */
let cache: Cache
const config = testConfigFile()
beforeEach(async () => {
	cache = new Cache(config)
	setMockConfig({})
})

test('disabled - 1 network call', async function () {
	const spy = vi.fn()
	const store = createStore([cachePolicyPlugin(false, spy), fakeFetch({})])
	const ret1 = await store.send({})

	expect(spy).toHaveBeenCalledTimes(1)

	expect(ret1).toMatchInlineSnapshot(`
			{
			    "data": {
			        "viewer": {
			            "id": "1",
			            "firstName": "bob"
			        }
			    },
			    "errors": [],
			    "fetching": false,
			    "variables": null,
			    "source": "network",
			    "partial": false
			}
		`)
})

test('2 network call', async function () {
	const spy = vi.fn()

	const store = createStore([cachePolicyPlugin(true, spy, cache), fakeFetch({})])
	const ret1 = await store.send({ policy: CachePolicy.NetworkOnly })
	const ret2 = await store.send({ policy: CachePolicy.NetworkOnly })

	expect(spy).toHaveBeenCalledTimes(2)

	expect(ret1).toMatchInlineSnapshot(`
			{
			    "data": {
			        "viewer": {
			            "id": "1",
			            "firstName": "bob"
			        }
			    },
			    "errors": [],
			    "fetching": false,
			    "variables": null,
			    "source": "network",
			    "partial": false
			}
		`)

	expect(ret2).toMatchInlineSnapshot(`
			{
			    "data": {
			        "viewer": {
			            "id": "1",
			            "firstName": "bob"
			        }
			    },
			    "errors": [],
			    "fetching": false,
			    "variables": null,
			    "source": "network",
			    "partial": false
			}
		`)
})

test('1 network call, second one coming from cache', async function () {
	const spy = vi.fn()

	const store = createStore([cachePolicyPlugin(true, spy, cache), fakeFetch({})])
	const ret1 = await store.send({ policy: CachePolicy.CacheOrNetwork })
	const ret2 = await store.send({ policy: CachePolicy.CacheOrNetwork })

	expect(spy).toHaveBeenCalledTimes(1)

	expect(ret1).toMatchInlineSnapshot(`
			{
			    "data": {
			        "viewer": {
			            "id": "1",
			            "firstName": "bob"
			        }
			    },
			    "errors": [],
			    "fetching": false,
			    "variables": null,
			    "source": "network",
			    "partial": false
			}
		`)

	expect(ret2).toMatchInlineSnapshot(`
			{
			    "data": {
			        "viewer": {
			            "id": "1",
			            "firstName": "bob"
			        }
			    },
			    "errors": [],
			    "fetching": false,
			    "variables": {},
			    "source": "cache",
			    "partial": false
			}
		`)
})

test('0 network call, because cache only', async function () {
	const spy = vi.fn()

	const store = createStore([cachePolicyPlugin(true, spy, cache), fakeFetch({})])
	const ret1 = await store.send({ policy: CachePolicy.CacheOnly })

	expect(spy).toHaveBeenCalledTimes(0)

	expect(ret1).toMatchInlineSnapshot(`
			{
			    "data": null,
			    "errors": [],
			    "fetching": false,
			    "variables": {},
			    "source": "cache",
			    "partial": false
			}
		`)
	console.log('ret1')
	const ret2 = await store.send({ policy: CachePolicy.CacheOrNetwork })
	expect(ret2).toMatchInlineSnapshot(`
		{
		    "data": {
		        "viewer": {
		            "id": "1",
		            "firstName": "bob"
		        }
		    },
		    "errors": [],
		    "fetching": false,
		    "variables": null,
		    "source": "network",
		    "partial": false
		}
	`)
	console.log('ret2')
	const ret3 = await store.send({ policy: CachePolicy.CacheOnly })
	expect(ret3).toMatchInlineSnapshot(`
		{
		    "data": {
		        "viewer": {
		            "id": "1",
		            "firstName": "bob"
		        }
		    },
		    "errors": [],
		    "fetching": false,
		    "variables": {},
		    "source": "cache",
		    "partial": false
		}
	`)
})
