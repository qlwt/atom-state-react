import { store_new } from "#src/util/store/new.js"
import type { Store } from "#src/util/store/type/store.js"
import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

type PaginatorStore_Node<Cursor, Data> = {
    data: sc.Signal<Data>
    cursor: { value: Cursor } | null
}

export type UsePaginatorStored_Node<Cursor, Data> = {
    readonly data: Data
    readonly index: string
    readonly cursor: { readonly value: Cursor } | null
}

export type UsePaginatorStored_InitApi<Cursor, Data> = {
    readonly nodes_saved: UsePaginatorStored_Node<Cursor, Data>[]
}

export type UsePaginatorStored_InitReturn<Cursor, Data> = {
    readonly data: Data
    readonly cursor: { readonly value: Cursor } | null
}

export type UsePaginatorStored_Init<Cursor, Data> = {
    (saved: UsePaginatorStored_InitApi<Cursor, Data>): (
        UsePaginatorStored_InitReturn<Cursor, Data>
    )
}

export type UsePaginatorStored_StorageConfig_Cleanup = {
    readonly delay: number
    readonly limit: number
}

export type UsePaginatorStored_StorageConfig = {
    readonly id: string
    readonly index: string
    readonly cleanup?: UsePaginatorStored_StorageConfig_Cleanup
}

export type UsePaginatorStored_Params<Cursor, Data> = {
    readonly paginator_config?: asc.Paginator_NewPure_Config
    readonly storage_config: UsePaginatorStored_StorageConfig

    readonly status_noabort?: boolean
    readonly deps_clear?: readonly unknown[]

    readonly request_new: asc.Paginator_NewPure_Request<Cursor>
    readonly init_new: UsePaginatorStored_Init<Cursor, Data>
}

export type UsePaginatorStored_Return<Data> = [
    paginator: asc.PaginatorPure,
    data: sc.Signal<Data>
]

const stores = new Map<string, {
    readonly deps: readonly unknown[]
    readonly store: Store<PaginatorStore_Node<any, any>>
}>

export const usePaginatorStored = function <Cursor, Data>(
    params: UsePaginatorStored_Params<Cursor, Data>
): UsePaginatorStored_Return<Data> {
    const nprop_deps_clear = params.deps_clear ?? []
    const nprop_status_noabort = params.status_noabort ?? false
    const nprop_storage_config_limit = params.storage_config.cleanup?.limit ?? null
    const nprop_storage_config_cleanup_delay = params.storage_config.cleanup?.delay ?? null

    const store = r.useMemo<Store<PaginatorStore_Node<Cursor, Data>>>(() => {
        let l_store = stores.get(params.storage_config.id)

        if (
            l_store
            && l_store.deps.length === nprop_deps_clear.length
            && l_store.deps.every((dep, i) => dep === nprop_deps_clear[i]!)
        ) {
            return l_store.store
        }

        {
            l_store = {
                store: store_new(),
                deps: nprop_deps_clear,
            }

            stores.set(params.storage_config.id, l_store)

            return l_store.store
        }
    }, [params.storage_config.id, ...nprop_deps_clear])

    const node = r.useMemo(() => {
        let l_node = store.node_get(params.storage_config.index)

        if (l_node) {
            return l_node.value
        }

        {
            const init = params.init_new({
                nodes_saved: [...store.node_entries()].map(([index, node]) => {
                    return {
                        index: index,
                        cursor: node.cursor,
                        data: node.data.output(),
                    }
                })
            })

            return store.node_set(params.storage_config.index, {
                cursor: init.cursor,
                data: sc.signal_new_value(init.data)
            })
        }
    }, [store, params.storage_config.index])

    r.useLayoutEffect(() => {
        return store.node_require(params.storage_config.index)
    }, [store, params.storage_config.index])

    r.useLayoutEffect((): VoidFunction | void => {
        if (typeof nprop_storage_config_cleanup_delay === "number") {
            return store.cleanupdelay_add(nprop_storage_config_cleanup_delay)
        }
    }, [store, nprop_storage_config_cleanup_delay])

    r.useLayoutEffect((): VoidFunction | void => {
        if (typeof nprop_storage_config_limit === "number") {
            return store.limit_add(nprop_storage_config_limit)
        }
    }, [store, nprop_storage_config_limit])

    const paginator = r.useMemo(() => {
        return asc.paginator_new_pure({
            config: params.paginator_config,

            request_new: async api => {
                const l_result = await params.request_new(api)

                node.cursor = l_result.cursor

                return l_result
            },

            init: {
                cursor: node.cursor,
            },
        })
    }, [node, params.request_new, ...asc.paginator_new_pure__config_deps(params.paginator_config)])

    r.useLayoutEffect((): VoidFunction | void => {
        if (!nprop_status_noabort) {
            return () => {
                paginator.clear()
            }
        }
    }, [nprop_status_noabort, paginator])

    return [
        paginator,
        node.data,
    ]
}
