import { test, expect } from 'vitest'

import { runPipeline } from '../../codegen'
import { mockCollectedDoc, testConfig } from '../../test'

test('adds pagination info to full', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
                    usersByCursor(first: 10) @paginate {
						edges {
							node {
								id
							}
						}
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0].document).toMatchInlineSnapshot(`
		fragment UserFriends on Query @arguments(first: {type: "Int", default: 10}, after: {type: "String"}, last: {type: "Int"}, before: {type: "String"}) {
		  usersByCursor(first: $first, after: $after, last: $last, before: $before) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		  __typename
		}
	`)

	expect(docs[0].refetch).toMatchInlineSnapshot(`
		{
		    "path": [
		        "usersByCursor"
		    ],
		    "method": "cursor",
		    "pageSize": 10,
		    "embedded": false,
		    "targetType": "Query",
		    "paginated": true,
		    "direction": "both",
		    "mode": "Infinite"
		}
	`)
})

test('paginated fragments on node pull data from one field deeper', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on User {
					friendsByCursor(first: 10) @paginate {
						edges {
							node {
								id
							}
						}
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	expect(docs[0].refetch).toMatchInlineSnapshot(`
		{
		    "path": [
		        "friendsByCursor"
		    ],
		    "method": "cursor",
		    "pageSize": 10,
		    "embedded": true,
		    "targetType": "Node",
		    "paginated": true,
		    "direction": "both",
		    "mode": "Infinite"
		}
	`)
})

test("doesn't add pagination info to offset pagination", async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
                    usersByOffset(limit: 10) @paginate {
						id
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0].document).toMatchInlineSnapshot(`
		fragment UserFriends on Query @arguments(limit: {type: "Int", default: 10}, offset: {type: "Int"}) {
		  usersByOffset(limit: $limit, offset: $offset) @paginate {
		    id
		  }
		  __typename
		}
	`)
})

test('paginate adds forwards cursor args to the full cursor fragment', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
                    usersByCursor(first: 10) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0].document).toMatchInlineSnapshot(`
		fragment UserFriends on Query @arguments(first: {type: "Int", default: 10}, after: {type: "String"}, last: {type: "Int"}, before: {type: "String"}) {
		  usersByCursor(first: $first, after: $after, last: $last, before: $before) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		  __typename
		}
	`)
})

test('paginate adds backwards cursor args to the full cursor fragment', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
                    usersByCursor(last: 10) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0].document).toMatchInlineSnapshot(`
		fragment UserFriends on Query @arguments(first: {type: "Int"}, after: {type: "String"}, last: {type: "Int", default: 10}, before: {type: "String"}) {
		  usersByCursor(last: $last, first: $first, after: $after, before: $before) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		  __typename
		}
	`)
})

test('paginate adds forwards cursor args to the fragment', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
                    usersByForwardsCursor(first: 10) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0].document).toMatchInlineSnapshot(`
		fragment UserFriends on Query @arguments(first: {type: "Int", default: 10}, after: {type: "String"}) {
		  usersByForwardsCursor(first: $first, after: $after) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		  __typename
		}
	`)
})

test('paginate adds backwards cursor args to the fragment', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
                    usersByBackwardsCursor(last: 10) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0].document).toMatchInlineSnapshot(`
		fragment UserFriends on Query @arguments {
		  usersByBackwardsCursor(last: 10) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		  __typename
		}
	`)
})

test('sets before with default value', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
                    usersByCursor(last: 10, before: "cursor") @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
		// mockCollectedDoc('')
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0].document).toMatchInlineSnapshot(`
		fragment UserFriends on Query @arguments(first: {type: "Int"}, after: {type: "String"}, last: {type: "Int", default: 10}, before: {type: "String", default: "cursor"}) {
		  usersByCursor(last: $last, before: $before, first: $first, after: $after) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		  __typename
		}
	`)
})

test('embeds pagination query as a separate document', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
                    usersByForwardsCursor(first: 10) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[1]?.document).toMatchInlineSnapshot(`
		query UserFriends_Pagination_Query($first: Int = 10, $after: String) {
		  ...UserFriends_jrGTj @with(first: $first, after: $after) @mask_disable
		}

		fragment UserFriends_jrGTj on Query @arguments(first: {type: "Int", default: 10}, after: {type: "String"}) {
		  usersByForwardsCursor(first: $first, after: $after) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		  __typename
		}
	`)
})

test('embeds node pagination query as a separate document', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on User {
                    friendsByForwardsCursor(first: 10) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the artifact generated for the document we added to the list
	await expect(docs[1]).toMatchInlineSnapshot(`
		export default {
		    "name": "UserFriends_Pagination_Query",
		    "kind": "HoudiniQuery",
		    "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",

		    "refetch": {
		        "path": ["friendsByForwardsCursor"],
		        "method": "cursor",
		        "pageSize": 10,
		        "embedded": true,
		        "targetType": "Node",
		        "paginated": true,
		        "direction": "forward",
		        "mode": "Infinite"
		    },

		    "raw": \`query UserFriends_Pagination_Query($first: Int = 10, $after: String, $id: ID!) {
		  node(id: $id) {
		    __typename
		    id
		    ...UserFriends_jrGTj
		  }
		}

		fragment UserFriends_jrGTj on User {
		  friendsByForwardsCursor(first: $first, after: $after) {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		  id
		  __typename
		}
		\`,

		    "rootType": "Query",

		    "selection": {
		        "fields": {
		            "node": {
		                "type": "Node",
		                "keyRaw": "node(id: $id)",
		                "nullable": true,

		                "selection": {
		                    "abstractFields": {
		                        "fields": {
		                            "User": {
		                                "friendsByForwardsCursor": {
		                                    "type": "UserConnection",
		                                    "keyRaw": "friendsByForwardsCursor::paginated",

		                                    "directives": [{
		                                        "name": "paginate",
		                                        "arguments": {}
		                                    }],

		                                    "selection": {
		                                        "fields": {
		                                            "edges": {
		                                                "type": "UserEdge",
		                                                "keyRaw": "edges",
		                                                "updates": ["append", "prepend"],

		                                                "selection": {
		                                                    "fields": {
		                                                        "node": {
		                                                            "type": "User",
		                                                            "keyRaw": "node",
		                                                            "nullable": true,

		                                                            "selection": {
		                                                                "fields": {
		                                                                    "id": {
		                                                                        "type": "ID",
		                                                                        "keyRaw": "id",
		                                                                        "visible": true
		                                                                    },

		                                                                    "__typename": {
		                                                                        "type": "String",
		                                                                        "keyRaw": "__typename",
		                                                                        "visible": true
		                                                                    }
		                                                                }
		                                                            },

		                                                            "visible": true
		                                                        },

		                                                        "cursor": {
		                                                            "type": "String",
		                                                            "keyRaw": "cursor",
		                                                            "visible": true
		                                                        }
		                                                    }
		                                                },

		                                                "visible": true
		                                            },

		                                            "pageInfo": {
		                                                "type": "PageInfo",
		                                                "keyRaw": "pageInfo",

		                                                "selection": {
		                                                    "fields": {
		                                                        "hasPreviousPage": {
		                                                            "type": "Boolean",
		                                                            "keyRaw": "hasPreviousPage",
		                                                            "updates": ["append", "prepend"],
		                                                            "visible": true
		                                                        },

		                                                        "hasNextPage": {
		                                                            "type": "Boolean",
		                                                            "keyRaw": "hasNextPage",
		                                                            "updates": ["append", "prepend"],
		                                                            "visible": true
		                                                        },

		                                                        "startCursor": {
		                                                            "type": "String",
		                                                            "keyRaw": "startCursor",
		                                                            "updates": ["append", "prepend"],
		                                                            "visible": true
		                                                        },

		                                                        "endCursor": {
		                                                            "type": "String",
		                                                            "keyRaw": "endCursor",
		                                                            "updates": ["append", "prepend"],
		                                                            "visible": true
		                                                        }
		                                                    }
		                                                },

		                                                "visible": true
		                                            }
		                                        }
		                                    },

		                                    "visible": true
		                                },

		                                "id": {
		                                    "type": "ID",
		                                    "keyRaw": "id",
		                                    "visible": true
		                                },

		                                "__typename": {
		                                    "type": "String",
		                                    "keyRaw": "__typename",
		                                    "visible": true
		                                }
		                            }
		                        },

		                        "typeMap": {}
		                    },

		                    "fields": {
		                        "__typename": {
		                            "type": "String",
		                            "keyRaw": "__typename",
		                            "visible": true
		                        },

		                        "id": {
		                            "type": "ID",
		                            "keyRaw": "id",
		                            "visible": true
		                        }
		                    },

		                    "fragments": {
		                        "UserFriends": {
		                            "arguments": {
		                                "first": {
		                                    "kind": "Variable",

		                                    "name": {
		                                        "kind": "Name",
		                                        "value": "first"
		                                    }
		                                },

		                                "after": {
		                                    "kind": "Variable",

		                                    "name": {
		                                        "kind": "Name",
		                                        "value": "after"
		                                    }
		                                }
		                            }
		                        }
		                    }
		                },

		                "abstract": true,
		                "visible": true
		            }
		        }
		    },

		    "pluginData": {},

		    "input": {
		        "fields": {
		            "first": "Int",
		            "after": "String",
		            "id": "ID"
		        },

		        "types": {}
		    },

		    "policy": "CacheOrNetwork",
		    "partial": false
		};

		"HoudiniHash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
	`)
})

test('embeds custom pagination query as a separate document', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserGhost on Ghost {
                    friendsConnection(first: 10) @paginate {
                        edges {
                            node {
								name
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig({
		types: {
			Ghost: {
				keys: ['name', 'aka'],
				resolve: {
					queryField: 'ghost',
					arguments: (ghost) => ({
						name: ghost.name,
						aka: ghost.aka,
					}),
				},
			},
		},
	})
	await runPipeline(config, docs)

	// load the contents of the file
	await expect(docs[1]).toMatchInlineSnapshot(`
		export default {
		    "name": "UserGhost_Pagination_Query",
		    "kind": "HoudiniQuery",
		    "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",

		    "refetch": {
		        "path": ["friendsConnection"],
		        "method": "cursor",
		        "pageSize": 10,
		        "embedded": true,
		        "targetType": "Ghost",
		        "paginated": true,
		        "direction": "forward",
		        "mode": "Infinite"
		    },

		    "raw": \`query UserGhost_Pagination_Query($first: Int = 10, $after: String, $name: String!, $aka: String!) {
		  ghost(name: $name, aka: $aka) {
		    __typename
		    name
		    aka
		    ...UserGhost_jrGTj
		  }
		}

		fragment UserGhost_jrGTj on Ghost {
		  friendsConnection(first: $first, after: $after) {
		    edges {
		      node {
		        name
		        aka
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		  name
		  aka
		  __typename
		}
		\`,

		    "rootType": "Query",

		    "selection": {
		        "fields": {
		            "ghost": {
		                "type": "Ghost",
		                "keyRaw": "ghost(aka: $aka, name: $name)",

		                "selection": {
		                    "fields": {
		                        "friendsConnection": {
		                            "type": "GhostConnection",
		                            "keyRaw": "friendsConnection::paginated",

		                            "directives": [{
		                                "name": "paginate",
		                                "arguments": {}
		                            }],

		                            "selection": {
		                                "fields": {
		                                    "edges": {
		                                        "type": "GhostEdge",
		                                        "keyRaw": "edges",
		                                        "updates": ["append", "prepend"],

		                                        "selection": {
		                                            "fields": {
		                                                "node": {
		                                                    "type": "Ghost",
		                                                    "keyRaw": "node",
		                                                    "nullable": true,

		                                                    "selection": {
		                                                        "fields": {
		                                                            "name": {
		                                                                "type": "String",
		                                                                "keyRaw": "name",
		                                                                "visible": true
		                                                            },

		                                                            "aka": {
		                                                                "type": "String",
		                                                                "keyRaw": "aka",
		                                                                "visible": true
		                                                            },

		                                                            "__typename": {
		                                                                "type": "String",
		                                                                "keyRaw": "__typename",
		                                                                "visible": true
		                                                            }
		                                                        }
		                                                    },

		                                                    "visible": true
		                                                },

		                                                "cursor": {
		                                                    "type": "String",
		                                                    "keyRaw": "cursor",
		                                                    "visible": true
		                                                }
		                                            }
		                                        },

		                                        "visible": true
		                                    },

		                                    "pageInfo": {
		                                        "type": "PageInfo",
		                                        "keyRaw": "pageInfo",

		                                        "selection": {
		                                            "fields": {
		                                                "hasPreviousPage": {
		                                                    "type": "Boolean",
		                                                    "keyRaw": "hasPreviousPage",
		                                                    "updates": ["append", "prepend"],
		                                                    "visible": true
		                                                },

		                                                "hasNextPage": {
		                                                    "type": "Boolean",
		                                                    "keyRaw": "hasNextPage",
		                                                    "updates": ["append", "prepend"],
		                                                    "visible": true
		                                                },

		                                                "startCursor": {
		                                                    "type": "String",
		                                                    "keyRaw": "startCursor",
		                                                    "updates": ["append", "prepend"],
		                                                    "visible": true
		                                                },

		                                                "endCursor": {
		                                                    "type": "String",
		                                                    "keyRaw": "endCursor",
		                                                    "updates": ["append", "prepend"],
		                                                    "visible": true
		                                                }
		                                            }
		                                        },

		                                        "visible": true
		                                    }
		                                }
		                            },

		                            "visible": true
		                        },

		                        "name": {
		                            "type": "String",
		                            "keyRaw": "name",
		                            "visible": true
		                        },

		                        "aka": {
		                            "type": "String",
		                            "keyRaw": "aka",
		                            "visible": true
		                        },

		                        "__typename": {
		                            "type": "String",
		                            "keyRaw": "__typename",
		                            "visible": true
		                        }
		                    },

		                    "fragments": {
		                        "UserGhost": {
		                            "arguments": {
		                                "first": {
		                                    "kind": "Variable",

		                                    "name": {
		                                        "kind": "Name",
		                                        "value": "first"
		                                    }
		                                },

		                                "after": {
		                                    "kind": "Variable",

		                                    "name": {
		                                        "kind": "Name",
		                                        "value": "after"
		                                    }
		                                }
		                            }
		                        }
		                    }
		                },

		                "visible": true
		            }
		        }
		    },

		    "pluginData": {},

		    "input": {
		        "fields": {
		            "first": "Int",
		            "after": "String",
		            "name": "String",
		            "aka": "String"
		        },

		        "types": {}
		    },

		    "policy": "CacheOrNetwork",
		    "partial": false
		};

		"HoudiniHash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
	`)
})

test('query with forwards cursor paginate', async function () {
	const docs = [
		mockCollectedDoc(
			`
                query Users {
                    usersByForwardsCursor(first: 10) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0]?.document).toMatchInlineSnapshot(`
		query Users($first: Int = 10, $after: String) {
		  usersByForwardsCursor(first: $first, after: $after) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		}
	`)
})

test('query with custom first args', async function () {
	const docs = [
		mockCollectedDoc(
			`
                query Users ($limit: Int!){
                    usersByForwardsCursor(first: $limit) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0]?.document).toMatchInlineSnapshot(`
		query Users($limit: Int!, $after: String) {
		  usersByForwardsCursor(first: $limit, after: $after) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		}
	`)
})

test('query with backwards cursor paginate', async function () {
	const docs = [
		mockCollectedDoc(
			`
                query Users {
                    usersByBackwardsCursor(last: 10) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0]?.document).toMatchInlineSnapshot(`
		query Users {
		  usersByBackwardsCursor(last: 10) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		}
	`)
})

test('query with offset paginate', async function () {
	const docs = [
		mockCollectedDoc(
			`
                query Users {
                    usersByOffset(limit: 10) @paginate {
						id
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0]?.document).toMatchInlineSnapshot(`
		query Users($limit: Int = 10, $offset: Int) {
		  usersByOffset(limit: $limit, offset: $offset) @paginate {
		    id
		  }
		}

	`)
})

test('query with backwards cursor on full paginate', async function () {
	const docs = [
		mockCollectedDoc(
			`
                query Users {
                    usersByCursor(last: 10) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0]?.document).toMatchInlineSnapshot(`
		query Users($first: Int, $after: String, $last: Int = 10, $before: String) {
		  usersByCursor(last: $last, first: $first, after: $after, before: $before) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		}
	`)
})

test('query with forwards cursor on full paginate', async function () {
	const docs = [
		mockCollectedDoc(
			`
                query Users {
                    usersByCursor(first: 10) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0]?.document).toMatchInlineSnapshot(`
		query Users($first: Int = 10, $after: String, $last: Int, $before: String) {
		  usersByCursor(first: $first, after: $after, last: $last, before: $before) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		}
	`)
})

test("don't generate unsupported directions", async function () {
	const docs = [
		mockCollectedDoc(
			`
                query Users {
                    usersByForwardsCursor(first: 10) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0]?.document).toMatchInlineSnapshot(`
		query Users($first: Int = 10, $after: String) {
		  usersByForwardsCursor(first: $first, after: $after) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		}
	`)
})

test("forwards cursor paginated query doesn't overlap variables", async function () {
	const docs = [
		mockCollectedDoc(
			`
                query Users($first: Int!) {
                    usersByCursor(first: $first) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0]?.document).toMatchInlineSnapshot(`
		query Users($first: Int!, $after: String, $last: Int, $before: String) {
		  usersByCursor(first: $first, after: $after, last: $last, before: $before) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		}
	`)
})

test("backwards cursor paginated query doesn't overlap variables", async function () {
	const docs = [
		mockCollectedDoc(
			`
                query Users($last: Int!) {
                    usersByCursor(last: $last) @paginate {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0]?.document).toMatchInlineSnapshot(`
		query Users($last: Int!, $first: Int, $after: String, $before: String) {
		  usersByCursor(last: $last, first: $first, after: $after, before: $before) @paginate {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		}
	`)
})

test("offset paginated query doesn't overlap variables", async function () {
	const docs = [
		mockCollectedDoc(
			`
                query Users($limit: Int! = 10) {
                    usersByOffset(limit: $limit) @paginate {
						id
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0]?.document).toMatchInlineSnapshot(`
		query Users($limit: Int! = 10, $offset: Int) {
		  usersByOffset(limit: $limit, offset: $offset) @paginate {
		    id
		  }
		}

	`)
})

test('refetch specification with backwards pagination', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
					usersByCursor(last: 10) @paginate {
						edges {
							node {
								id
							}
						}
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	expect(docs[0].refetch).toMatchInlineSnapshot(`
		{
		    "path": [
		        "usersByCursor"
		    ],
		    "method": "cursor",
		    "pageSize": 10,
		    "embedded": false,
		    "targetType": "Query",
		    "paginated": true,
		    "direction": "both",
		    "mode": "Infinite"
		}
	`)
})

test('refetch entry with initial backwards', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
					usersByCursor(last: 10, before: "1234") @paginate {
						edges {
							node {
								id
							}
						}
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	expect(docs[0].refetch).toMatchInlineSnapshot(`
		{
		    "path": [
		        "usersByCursor"
		    ],
		    "method": "cursor",
		    "pageSize": 10,
		    "embedded": false,
		    "targetType": "Query",
		    "paginated": true,
		    "direction": "both",
		    "start": "1234",
		    "mode": "Infinite"
		}
	`)
})

test('refetch entry with initial forwards', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
					usersByCursor(first: 10, after: "1234") @paginate {
						edges {
							node {
								id
							}
						}
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	expect(docs[0].refetch).toMatchInlineSnapshot(`
		{
		    "path": [
		        "usersByCursor"
		    ],
		    "method": "cursor",
		    "pageSize": 10,
		    "embedded": false,
		    "targetType": "Query",
		    "paginated": true,
		    "direction": "both",
		    "start": "1234",
		    "mode": "Infinite"
		}
	`)
})

test('generated query has same refetch spec', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
					usersByCursor(first: 10, after: "1234") @paginate {
						edges {
							node {
								id
							}
						}
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	await expect(docs[1]).toMatchInlineSnapshot(`
		export default {
		    "name": "UserFriends_Pagination_Query",
		    "kind": "HoudiniQuery",
		    "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",

		    "refetch": {
		        "path": ["usersByCursor"],
		        "method": "cursor",
		        "pageSize": 10,
		        "embedded": false,
		        "targetType": "Query",
		        "paginated": true,
		        "direction": "both",
		        "start": "1234",
		        "mode": "Infinite"
		    },

		    "raw": \`query UserFriends_Pagination_Query($first: Int = 10, $after: String = "1234", $last: Int, $before: String) {
		  ...UserFriends_2Bf0M6
		}

		fragment UserFriends_2Bf0M6 on Query {
		  usersByCursor(first: $first, after: $after, last: $last, before: $before) {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		  __typename
		}
		\`,

		    "rootType": "Query",

		    "selection": {
		        "fields": {
		            "usersByCursor": {
		                "type": "UserConnection",
		                "keyRaw": "usersByCursor::paginated",

		                "directives": [{
		                    "name": "paginate",
		                    "arguments": {}
		                }],

		                "selection": {
		                    "fields": {
		                        "edges": {
		                            "type": "UserEdge",
		                            "keyRaw": "edges",
		                            "updates": ["append", "prepend"],

		                            "selection": {
		                                "fields": {
		                                    "node": {
		                                        "type": "User",
		                                        "keyRaw": "node",
		                                        "nullable": true,

		                                        "selection": {
		                                            "fields": {
		                                                "id": {
		                                                    "type": "ID",
		                                                    "keyRaw": "id",
		                                                    "visible": true
		                                                },

		                                                "__typename": {
		                                                    "type": "String",
		                                                    "keyRaw": "__typename",
		                                                    "visible": true
		                                                }
		                                            }
		                                        },

		                                        "visible": true
		                                    },

		                                    "cursor": {
		                                        "type": "String",
		                                        "keyRaw": "cursor",
		                                        "visible": true
		                                    }
		                                }
		                            },

		                            "visible": true
		                        },

		                        "pageInfo": {
		                            "type": "PageInfo",
		                            "keyRaw": "pageInfo",

		                            "selection": {
		                                "fields": {
		                                    "hasPreviousPage": {
		                                        "type": "Boolean",
		                                        "keyRaw": "hasPreviousPage",
		                                        "updates": ["append", "prepend"],
		                                        "visible": true
		                                    },

		                                    "hasNextPage": {
		                                        "type": "Boolean",
		                                        "keyRaw": "hasNextPage",
		                                        "updates": ["append", "prepend"],
		                                        "visible": true
		                                    },

		                                    "startCursor": {
		                                        "type": "String",
		                                        "keyRaw": "startCursor",
		                                        "updates": ["append", "prepend"],
		                                        "visible": true
		                                    },

		                                    "endCursor": {
		                                        "type": "String",
		                                        "keyRaw": "endCursor",
		                                        "updates": ["append", "prepend"],
		                                        "visible": true
		                                    }
		                                }
		                            },

		                            "visible": true
		                        }
		                    }
		                },

		                "visible": true
		            },

		            "__typename": {
		                "type": "String",
		                "keyRaw": "__typename",
		                "visible": true
		            }
		        },

		        "fragments": {
		            "UserFriends": {
		                "arguments": {
		                    "first": {
		                        "kind": "Variable",

		                        "name": {
		                            "kind": "Name",
		                            "value": "first"
		                        }
		                    },

		                    "after": {
		                        "kind": "Variable",

		                        "name": {
		                            "kind": "Name",
		                            "value": "after"
		                        }
		                    },

		                    "last": {
		                        "kind": "Variable",

		                        "name": {
		                            "kind": "Name",
		                            "value": "last"
		                        }
		                    },

		                    "before": {
		                        "kind": "Variable",

		                        "name": {
		                            "kind": "Name",
		                            "value": "before"
		                        }
		                    }
		                }
		            }
		        }
		    },

		    "pluginData": {},

		    "input": {
		        "fields": {
		            "first": "Int",
		            "after": "String",
		            "last": "Int",
		            "before": "String"
		        },

		        "types": {}
		    },

		    "policy": "CacheOrNetwork",
		    "partial": false
		};

		"HoudiniHash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
	`)
})

test('refetch specification with offset pagination', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
					usersByOffset(limit: 10) @paginate {
						id
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	expect(docs[0].refetch).toMatchInlineSnapshot(`
		{
		    "path": [
		        "usersByOffset"
		    ],
		    "method": "offset",
		    "pageSize": 10,
		    "embedded": false,
		    "targetType": "Query",
		    "paginated": true,
		    "direction": "forward",
		    "mode": "Infinite"
		}
	`)
})

test('refetch specification with initial offset', async function () {
	const docs = [
		mockCollectedDoc(
			`
                fragment UserFriends on Query {
					usersByOffset(limit: 10, offset: 10) @paginate {
						id
                    }
                }
			`
		),
	]

	// run the pipeline
	const config = testConfig()
	await runPipeline(config, docs)

	expect(docs[0].refetch).toMatchInlineSnapshot(`
		{
		    "path": [
		        "usersByOffset"
		    ],
		    "method": "offset",
		    "pageSize": 10,
		    "embedded": false,
		    "targetType": "Query",
		    "paginated": true,
		    "direction": "forward",
		    "start": 10,
		    "mode": "Infinite"
		}
	`)
})

test('default defaultPaginateMode to SinglePage', async function () {
	const docs = [
		mockCollectedDoc(
			`fragment UserFriends on Query {
				usersByCursor(first: 10) @paginate {
					edges {
						node {
							id
						}
					}
				}
			}
			`
		),
	]

	// run the pipeline
	const config = testConfig({ defaultPaginateMode: 'SinglePage' })
	await runPipeline(config, docs)

	// load the contents of the file
	expect(docs[0]).toMatchInlineSnapshot(`
		export default {
		    "name": "UserFriends",
		    "kind": "HoudiniFragment",
		    "hash": "c0276291ccf0e89ecf3e2c0fd68314703c62c8dca06915e602f931297be94c3c",

		    "refetch": {
		        "path": ["usersByCursor"],
		        "method": "cursor",
		        "pageSize": 10,
		        "embedded": false,
		        "targetType": "Query",
		        "paginated": true,
		        "direction": "both",
		        "mode": "SinglePage"
		    },

		    "raw": \`fragment UserFriends on Query {
		  usersByCursor(first: $first, after: $after, last: $last, before: $before) {
		    edges {
		      node {
		        id
		      }
		    }
		    edges {
		      cursor
		      node {
		        __typename
		      }
		    }
		    pageInfo {
		      hasPreviousPage
		      hasNextPage
		      startCursor
		      endCursor
		    }
		  }
		  __typename
		}
		\`,

		    "rootType": "Query",

		    "selection": {
		        "fields": {
		            "usersByCursor": {
		                "type": "UserConnection",
		                "keyRaw": "usersByCursor(after: $after, before: $before, first: $first, last: $last)::paginated",

		                "directives": [{
		                    "name": "paginate",
		                    "arguments": {}
		                }],

		                "selection": {
		                    "fields": {
		                        "edges": {
		                            "type": "UserEdge",
		                            "keyRaw": "edges",
		                            "updates": ["append", "prepend"],

		                            "selection": {
		                                "fields": {
		                                    "node": {
		                                        "type": "User",
		                                        "keyRaw": "node",
		                                        "nullable": true,

		                                        "selection": {
		                                            "fields": {
		                                                "id": {
		                                                    "type": "ID",
		                                                    "keyRaw": "id",
		                                                    "visible": true
		                                                },

		                                                "__typename": {
		                                                    "type": "String",
		                                                    "keyRaw": "__typename",
		                                                    "visible": true
		                                                }
		                                            }
		                                        },

		                                        "visible": true
		                                    },

		                                    "cursor": {
		                                        "type": "String",
		                                        "keyRaw": "cursor",
		                                        "visible": true
		                                    }
		                                }
		                            },

		                            "visible": true
		                        },

		                        "pageInfo": {
		                            "type": "PageInfo",
		                            "keyRaw": "pageInfo",

		                            "selection": {
		                                "fields": {
		                                    "hasPreviousPage": {
		                                        "type": "Boolean",
		                                        "keyRaw": "hasPreviousPage",
		                                        "updates": ["append", "prepend"],
		                                        "visible": true
		                                    },

		                                    "hasNextPage": {
		                                        "type": "Boolean",
		                                        "keyRaw": "hasNextPage",
		                                        "updates": ["append", "prepend"],
		                                        "visible": true
		                                    },

		                                    "startCursor": {
		                                        "type": "String",
		                                        "keyRaw": "startCursor",
		                                        "updates": ["append", "prepend"],
		                                        "visible": true
		                                    },

		                                    "endCursor": {
		                                        "type": "String",
		                                        "keyRaw": "endCursor",
		                                        "updates": ["append", "prepend"],
		                                        "visible": true
		                                    }
		                                }
		                            },

		                            "visible": true
		                        }
		                    }
		                },

		                "visible": true
		            },

		            "__typename": {
		                "type": "String",
		                "keyRaw": "__typename",
		                "visible": true
		            }
		        }
		    },

		    "pluginData": {},

		    "input": {
		        "fields": {
		            "first": "Int",
		            "after": "String",
		            "last": "Int",
		            "before": "String"
		        },

		        "types": {}
		    }
		};

		"HoudiniHash=c0276291ccf0e89ecf3e2c0fd68314703c62c8dca06915e602f931297be94c3c";
	`)
})
