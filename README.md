# @qyu/atom-state-react

React hooks for @qyu/atom-state-core

```tsx
import * as asc from "@qyu/atom-state-core"
import * as asr from "@qyu/atom-state-react"

const atom_state = asc.state_atom(() => 10)

const App = function () {
    const [state, state_set] = asr.useStateControls(atom_state)

    return <div>
        {state}

        <button onClick={() => { state_set(n => n + 10) }}>
            Increase By 10
        </button>
    </div>
}
```

## Prepare

- You have to register a `StoreContext` at the root of your app

```tsx
import * as asc from "@qyu/atom-state-core"
import * as asr from "@qyu/atom-state-react"

const store = asc.store_new()

const root = <asr.StoreContext.Provider value={store}>
    <App />
</asr.StoreContext.Provider>
```

## Basic Hooks

- `useStore` returns a `Store` from the context
- `useDispatch` returns a `dispatch` function from the store
- `useValue` registers an `Atom` and returns a value
- `useValueFallback` register an `Atom` conditionally, returns fallback

## State related hooks

- `useStateOutput` returns an output of an `Atom` of `Signal`
- `useStateControls` returns react-style state management from an `Atom` of `Signal`
- `useStateConnect` returns connection of an `Atom` of `Signal`
- `useStateFallback` calls an effect on change in `Atom` of `Signal`
- `useStateOutputFallback` returns an output of an `Atom` of `Signal` conditionally

## Utilities for common operations

- `useFamilyChild` registers parameter in `Family`
- `useFamilyChildFallback` registers parameter in `Family` conditionally
- `useIndexerRaw` returns filtered list from indexer
- `useIndexerJoin` returns filtered list from indexer with a `join` applied
- `useIndexerJoinData` returns filtered list from indexer with a `join` applied and `.data` property extracted
- `useIndexerPipe` returns filtered list from indexer with a `transformer` applied
- `useIndexerRemView` returns filtered list from indexer with `remview` applied
- `useIndexerRemViewData` returns filtered list from indexer with `remview` applied and `.data` property extracted
- theese operations also supported for `useProp*` (normal value), `usePropS*` (`Signal` of value), `useList` (normal list), `useListS` (`Signal` of list)

```tsx
import * as asc from "@qyu/atom-state-core"
import * as asr from "@qyu/atom-state-react"
import * as sr from "@qyu/signal-react"

interface RemDef extends asc.RemNode_Def {
    data: {
        id: string
        name: string
        kind: number
    }

    statics: {
        id: string
    }
}

// define table of remote data
const atom_remfamily = asc.family_atom_hash(() => ({
    key: (id: string) => id,

    get: (id: string) => asc.remnode_atom<RemDef>(() => ({
        init: null,
        statics: { id },
    })),
}))

// define indexer
const atom_indexer = asc.value_atom_advanced(({ reg }) => {
    const indexer = asc.indexer_new_wrap({
        data_new: (in_data: asc.RemView<RemDef>) => {
            return in_data.data && {
                value: in_data.data.kind,
            }
        },

        filter_new: (in_filter: number) => {
            return in_filter
        },

        indexer: asc.indexer_new_pair_head({
            right_newf: asc.indexer_newf_list_pure<asc.RemNode<RemDef>>(),
            left_newl: asc.indexer_newl_identity<asc.RemNode<RemDef>, number>(),
        }),
    })

    // connect the family to indexer
    const cleanup = asc.indexer_connect_family_remnode({
        indexer,
        src: reg(atom_remfamily),
        view_new: asc.remview_new_node,
        callbatcher: asc.throttler_new_microtask(),
    } as const)

    return {
        value: indexer,
        config: { cleanup },
    }
})

const join = asc.selector_atom(({ reg }) => asc.join_new_remnode({
    joins: {} as const,
    link_new: (remnode: asc.RemNode<RemDef>) => reg(atom_remfamily).reg(remnode.statics.id),
}))

let idgen = 0

export const App = function() {
    const remfamily = asr.useValue(atom_remfamily)

    // extract from Signal
    const node_list = sr.useSignalOutput(
        // get list of NonNullable<Join["data"]>
        asr.useIndexerJoinData({
            // get an indexer
            indexer: asr.useValue(atom_indexer),
            // filter the indexer
            filter: 0,
            // use join
            join: asr.useValue(join),
        })
    )

    return <div>
        <button
            onClick={() => {
                const id = (idgen++).toString()

                remfamily.reg(id).real.input(asc.reqstate_new_fulfilled({
                    id,
                    kind: 0,
                    name: "Element",
                }))
            }}
        >
            Push Element
        </button>

        {node_list.map(node => {
            return <span key={node.core.id}>
                {node.core.name}
            </span>
        })}
    </div>
}
```

## Loading remote state through `Loader`

- `Loader` is designed for loading remote state in a way that is shared between components
- If same `Loader` is requested from different components - only one request is actually running
- `useLoaderRequest` - request the `Loader` with given payload
- `useLoaderSRequest` - request the `Signal` of `Loader` with given payload
- `useLoaderRequestPure` - request the `Loader` with no payload
- `useLoaderSRequestPure` - request the `Signal` of `Loader` with no payload

## Loading remote state through `Query` and `Paginator`

- `useQueryPure` - calls a query, stateless. Use when state is derived (eg. from `Indexer`)
- `useQueryStateful` - calls a query and saves the resulting state
- `useQueryStored` - calls a query and saves state in a specific storage
- `usePaginatorPure` - returns a paginator, only saves a pointer. Use when state is derived (eg. from `Indexer`)
- `usePaginatorStateful` - returns a paginator and saves the resulting state
- `usePaginatorStored` - returns a paginator and saves state in a specific storage

## *Stored variants of `Query` and `Paginator` hooks

- `use*Stored` creates a paginator that is stored in a storage of given `.id`
- The purpose is so it is preserved after the component despawns
- `.index` represents an arbitrary parameter (eg. search). Hook will create one instance of `Paginator` per `.index`
- `.limit` limits the maximum amount of registered `indexes`. When it overflows, unused ones will be removed after delay
- Use case is a display with a search bar. On each search an `index` is registered, when user returns to previous searches `state` is preserved

### Using `usePaginatorStored`

```tsx
import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as sr from "@qyu/signal-react"
import * as r from "react"
import * as rdom from "react-dom/client"
import * as asr from "@qyu/atom-state-react"

type Item = {
    id: number
    value: number
}

// generate random items
const items = Array.from({ length: 40 }, (_, id) => {
    return {
        id,
        value: Math.random()
    } satisfies Item
})

type ApiRes = {
    readonly items: Item[]
    readonly status_finished: boolean
}

// fake api
// returns {limit} items starting from {cursor} with value >= {search}
const api_get = async function(cursor: number | null, limit: number, search: number): Promise<ApiRes> {
    // delay to make it feel like a real api
    await new Promise(resolve => setTimeout(resolve, 1000))

    const items_filtered = items.filter(item => {
        return (
            (cursor === null || item.id > cursor)
            && item.value >= search
        )
    })

    const result = {
        items: items_filtered.slice(0, limit),
        status_finished: items_filtered.length <= limit,
    }

    return result
}

const search_parse = function(search_raw: string): number {
    const search_parsed = Number.parseFloat(search_raw)

    if (Number.isNaN(search_parsed)) {
        return 0
    }

    return search_parsed
}

type PaginatorData = {
    readonly search_num: number
    readonly item_list: readonly Item[]
}

const App = function() {
    // will search for elements >= Number.parseFloat(search)
    const [search, search_set] = r.useState("")
    const search_num = r.useMemo(() => search_parse(search), [search])

    const [paginator, paginator_data_s] = asr.usePaginatorStored<number | null, PaginatorData>({
        // clear the whole thing
        deps_clear: [],
        // if set true, will not auto-abort request when paginator is updated
        status_noabort: false,

        storage_config: {
            id: "app::paginator",
            index: search_num.toString(),

            cleanup: {
                // for the sake of the example low limit and cleanup delay is set
                limit: 1,
                // cleanup after four second of beeing unused
                delay: 4e3,
            },
        },

        paginator_config: {
            retry: {
                delay: 1e3,
            },
        },

        // calculate data based on other indexes
        // for most queries it is hard to reliably do that so you would just return initial value
        init_new: r.useCallback(api => {
            // find the node that is more inclusive than current search
            // then filter elements from it to fit the search
            const src = api.nodes_saved.find(node => node.data.search_num < search_num)

            return {
                cursor: src ? src.cursor : { value: null },

                data: {
                    search_num,
                    item_list: src ? src.data.item_list.filter(i => i.value >= search_num) : [],
                },
            }
        }, [search_num]),

        request_new: r.useCallback(api => {
            return api_get(api.cursor, 15, search_num).then(result => {
                // api.signal_abort to know when request is aborted
                if (!api.signal_abort.aborted) {
                    const paginator_output = paginator_data_s.output()

                    // you need to update the state manually
                    paginator_data_s.input({
                        ...paginator_output,

                        item_list: [...paginator_output.item_list, ...result.items]
                    })
                }

                // will be ignored if aborted
                return {
                    // returning null means query is finiished
                    cursor: (result.status_finished
                        ? null
                        : { value: result.items.at(-1)!.id }
                    ),
                }
            })
        }, [search_num])
    })

    // so you are able to use the paginator data in react
    const paginator_list = sr.useSignalOutput(r.useMemo(() => {
        return sc.osignal_new_pipe(paginator_data_s, paginator_data => paginator_data.item_list)
    }, [paginator_data_s]))

    // track status
    const paginator_status = sr.useSignalOutput(paginator.status)

    return <div>
        <input
            value={search}
            placeholder={`Search Number`}
            onChange={ev => search_set(ev.target.value)}
        />

        <br />

        <button
            onClick={() => {
                if (paginator_status === asc.Paginator_Status.Idle) {
                    paginator.load()
                }
            }}
        >
            <span style={{ display: paginator_status !== asc.Paginator_Status.Pending ? "none" : void 0 }}>
                Loading...
            </span>

            <span style={{ display: paginator_status !== asc.Paginator_Status.Idle ? "none" : void 0 }}>
                Load More
            </span>

            <span style={{ display: paginator_status !== asc.Paginator_Status.Fulfilled ? "none" : void 0 }}>
                Finished
            </span>
        </button>

        <br />

        {paginator_list.map(item => {
            return <r.Fragment key={item.id}>
                <span>
                    item.value: {item.value}
                </span>

                <br />
            </r.Fragment>
        })}
    </div>
}

const root_el = document.createElement("div")
const root_r = rdom.createRoot(root_el)
const store = asc.store_new()

document.body.appendChild(root_el)

root_r.render(
    <asr.StoreContext.Provider value={store}>
        <App />
    </asr.StoreContext.Provider>
)
```
