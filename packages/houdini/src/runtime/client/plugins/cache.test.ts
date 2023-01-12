import { beforeEach, expect, Mock, test, vi } from 'vitest'

import { CachePolicy } from '../../lib'
import { setMockConfig } from '../../lib/config'
import { createStore, History, terminate } from '../_client_helper.test'
import { cachePolicyPlugin } from './cache'

// prepare tests for this file
const history = new History()
beforeEach(async () => {
	history.reset()
	setMockConfig({})
})

test('disabled - 1 network call', async function () {
	const spy = vi.fn()
	const store = createStore([cachePolicyPlugin(false, spy), terminate({})], false)
	await store.send({})

	expect(spy).toHaveBeenCalledTimes(1)
})

test('2 network call', async function () {
	const spy = vi.fn()

	const store = createStore([cachePolicyPlugin(true, spy), terminate({})], true)
	await store.send({ policy: CachePolicy.NetworkOnly })
	await store.send({ policy: CachePolicy.NetworkOnly })

	expect(spy).toHaveBeenCalledTimes(2)
})

test('1 network call', async function () {
	const spy = vi.fn()

	const store = createStore([cachePolicyPlugin(true, spy), terminate({})], true)
	await store.send({ policy: CachePolicy.CacheOrNetwork })
	await store.send({ policy: CachePolicy.CacheOrNetwork })

	expect(spy).toHaveBeenCalledTimes(1)
})

test('0 network call', async function () {
	const spy = vi.fn()

	const store = createStore([cachePolicyPlugin(true, spy), terminate({})], true)
	await store.send({ policy: CachePolicy.CacheOnly })

	expect(spy).toHaveBeenCalledTimes(0)
})
