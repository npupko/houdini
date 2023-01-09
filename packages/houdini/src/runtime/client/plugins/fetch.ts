import { DataSource, RequestPayload } from '../../lib'
import type { ClientPlugin } from '../documentObserver'

export const fetchMiddleware = (fetchFn: RequestHandler): ClientPlugin => {
	return () => {
		return {
			network: {
				async enter(ctx, { resolve }) {
					// figure out which fetch to use
					const fetch = ctx.fetch ?? globalThis.fetch

					// build up the params object
					const fetchParams: FetchParams = {
						text: ctx.artifact.raw,
						hash: ctx.artifact.hash,
						variables: ctx.variables ?? {},
					}

					// invoke the function
					const result = await fetchFn({
						// wrap the user's fetch function so we can identify SSR by checking
						// the response.url
						fetch: (url: URL | RequestInfo, args: RequestInit | undefined) => {
							// figure out if we need to do something special for multipart uploads
							const newArgs = handleMultipart(fetchParams, args)

							// use the new args if they exist, otherwise the old ones are good
							return fetch(url, {
								...(newArgs || args),
								...ctx.fetchParams,
							})
						},
						...fetchParams,
						metadata: ctx.metadata,
						session: ctx.session || {},
					})

					// return the result
					resolve(ctx, {
						result,
						partial: false,
						source: DataSource.Network,
					})
				},
			},
		}
	}
}

export type FetchContext = {
	fetch: typeof globalThis.fetch
	metadata?: App.Metadata | null
	session: App.Session | null
}

/**
 * ## Tip 👇
 *
 * To define types for your metadata, create a file `src/app.d.ts` containing the followingI:
 *
 * ```ts
 * declare namespace App { *
 * 	interface Metadata {}
 * }
 * ```
 *
 */
export type RequestHandlerArgs = FetchContext & FetchParams

export type RequestHandler<_Data = any> = (
	args: RequestHandlerArgs
) => Promise<RequestPayload<_Data>>

export type FetchParams = {
	text: string
	hash: string
	variables: { [key: string]: any }
}

function handleMultipart(
	params: FetchParams,
	args: RequestInit | undefined
): RequestInit | undefined {
	// process any files that could be included
	const { clone, files } = extractFiles({
		query: params.text,
		variables: params.variables,
	})

	// if there are files in the request
	if (files.size) {
		const req = args
		let headers: Record<string, string> = {}

		// filters `content-type: application/json` if received by client.ts
		if (req?.headers) {
			const filtered = Object.entries(req?.headers).filter(([key, value]) => {
				return !(
					key.toLowerCase() == 'content-type' && value.toLowerCase() == 'application/json'
				)
			})
			headers = Object.fromEntries(filtered)
		}

		// See the GraphQL multipart request spec:
		// https://github.com/jaydenseric/graphql-multipart-request-spec
		const form = new FormData()
		const operationJSON = JSON.stringify(clone)

		form.set('operations', operationJSON)

		const map: Record<string, Array<string>> = {}

		let i = 0
		files.forEach((paths) => {
			map[++i] = paths
		})
		form.set('map', JSON.stringify(map))

		i = 0
		files.forEach((paths, file) => {
			form.set(`${++i}`, file as Blob, (file as File).name)
		})

		return { ...req, headers, body: form as any }
	}
}

/// This file contains a modified version, made by AlecAivazis, of the functions found here: https://github.com/jaydenseric/extract-files/blob/master/extractFiles.mjs
/// The associated license is at the end of the file (per the project's license agreement)

export function isExtractableFile(value: any): value is ExtractableFile {
	return (
		(typeof File !== 'undefined' && value instanceof File) ||
		(typeof Blob !== 'undefined' && value instanceof Blob)
	)
}

type ExtractableFile = File | Blob

/** @typedef {import("./isExtractableFile.mjs").default} isExtractableFile */

export function extractFiles(value: any) {
	if (!arguments.length) throw new TypeError('Argument 1 `value` is required.')

	/**
	 * Deeply clonable value.
	 * @typedef {Array<unknown> | FileList | Record<PropertyKey, unknown>} Cloneable
	 */

	/**
	 * Clone of a {@link Cloneable deeply cloneable value}.
	 * @typedef {Exclude<Cloneable, FileList>} Clone
	 */

	/**
	 * Map of values recursed within the input value and their clones, for reusing
	 * clones of values that are referenced multiple times within the input value.
	 * @type {Map<Cloneable, Clone>}
	 */
	const clones = new Map()

	/**
	 * Extracted files and their object paths within the input value.
	 * @type {Extraction<Extractable>["files"]}
	 */
	const files = new Map()

	/**
	 * Recursively clones the value, extracting files.
	 */
	function recurse(value: any, path: string | string[], recursed: Set<any>) {
		if (isExtractableFile(value)) {
			const filePaths = files.get(value)

			filePaths ? filePaths.push(path) : files.set(value, [path])

			return null
		}

		const valueIsList =
			Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList)
		const valueIsPlainObject = isPlainObject(value)

		if (valueIsList || valueIsPlainObject) {
			let clone = clones.get(value)

			const uncloned = !clone

			if (uncloned) {
				clone = valueIsList
					? []
					: // Replicate if the plain object is an `Object` instance.
					value instanceof /** @type {any} */ Object
					? {}
					: Object.create(null)

				clones.set(value, /** @type {Clone} */ clone)
			}

			if (!recursed.has(value)) {
				const pathPrefix = path ? `${path}.` : ''
				const recursedDeeper = new Set(recursed).add(value)

				if (valueIsList) {
					let index = 0

					// @ts-ignore
					for (const item of value) {
						const itemClone = recurse(item, pathPrefix + index++, recursedDeeper)

						if (uncloned) /** @type {Array<unknown>} */ clone.push(itemClone)
					}
				} else
					for (const key in value) {
						const propertyClone = recurse(value[key], pathPrefix + key, recursedDeeper)

						if (uncloned)
							/** @type {Record<PropertyKey, unknown>} */ clone[key] = propertyClone
					}
			}

			return clone
		}

		return value
	}

	return {
		clone: recurse(value, '', new Set()),
		files,
	}
}

/**
 * An extraction result.
 * @template [Extractable=unknown] Extractable file type.
 * @typedef {object} Extraction
 * @prop {unknown} clone Clone of the original value with extracted files
 *   recursively replaced with `null`.
 * @prop {Map<Extractable, Array<ObjectPath>>} files Extracted files and their
 *   object paths within the original value.
 */

/**
 * String notation for the path to a node in an object tree.
 * @typedef {string} ObjectPath
 * @see [`object-path` on npm](https://npm.im/object-path).
 * @example
 * An object path for object property `a`, array index `0`, object property `b`:
 *
 * ```
 * a.0.b
 * ```
 */

function isPlainObject(value: any) {
	if (typeof value !== 'object' || value === null) {
		return false
	}

	const prototype = Object.getPrototypeOf(value)
	return (
		(prototype === null ||
			prototype === Object.prototype ||
			Object.getPrototypeOf(prototype) === null) &&
		!(Symbol.toStringTag in value) &&
		!(Symbol.iterator in value)
	)
}

// MIT License
// Copyright Jayden Seric

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.