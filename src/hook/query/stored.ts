import { store_new } from "#src/util/store/new.js"
import type { Store } from "#src/util/store/type/store.js"
import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as sr from "@qyu/signal-react"
import * as r from "react"

type QueryStore_Node<Data> = {
    status_finished: boolean
    data: sc.Signal<Data>
}

export type UseQueryStored_Node<Data> = {
    readonly data: Data
    readonly index: string
}

export type UseQueryStored_InitApi<Data> = {
    readonly nodes_saved: UseQueryStored_Node<Data>[]
}

export type UseQueryStored_InitReturn<Data> = {
    readonly data: Data
    readonly status_finished?: boolean
}

export type UseQueryStored_Init<Data> = {
    (saved: UseQueryStored_InitApi<Data>): (
        UseQueryStored_InitReturn<Data>
    )
}

export type UseQueryStored_StorageConfig_Cleanup = {
    readonly delay: number
    readonly limit: number
}

export type UseQueryStored_StorageConfig = {
    readonly id: string
    readonly index: string
    readonly cleanup?: UseQueryStored_StorageConfig_Cleanup | null
}

export type UseQueryStored_Params<Data> = {
    readonly status_disabled?: boolean

    readonly deps_clear?: unknown[]
    readonly query_config?: asc.Query_NewPure_Config
    readonly storage_config: UseQueryStored_StorageConfig

    readonly request_new: asc.Query_NewPure_Request
    readonly init_new: UseQueryStored_Init<Data>
}

export type UseQueryStored_Return<Data> = [
    query: asc.QueryPure,
    data: sc.Signal<Data>
]

const stores = new Map<string, {
    readonly deps: unknown[]
    readonly store: Store<QueryStore_Node<any>>
}>

export const useQueryStored = function <Data>(
    params: UseQueryStored_Params<Data>
): UseQueryStored_Return<Data> {
    const nprop_deps_clear = params.deps_clear ?? []
    const nprop_status_disabled = params.status_disabled
    const nprop_storage_config_limit = params.storage_config.cleanup?.limit ?? null
    const nprop_storage_config_cleanup_delay = params.storage_config.cleanup?.delay ?? null

    // intended to only be updated on id change
    const store = r.useMemo<Store<QueryStore_Node<Data>>>(() => {
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
                        data: node.data.output(),
                    }
                })
            })

            return store.node_set(params.storage_config.index, {
                status_finished: false,
                data: sc.signal_new_value(init.data)
            })
        }
    }, [store, params.storage_config.index])

    const query = r.useMemo(() => {
        return asc.query_new_pure({
            config: params.query_config,
            status_finished: node.status_finished,

            request_new: async (api) => {
                const result = await params.request_new(api)

                node.status_finished = true

                return result
            },
        })
    }, [node, params.request_new, , ...asc.query_new_pure__config_deps(params.query_config)])

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

    const query_status = sr.useSignalOutputFallback(null, nprop_status_disabled ? null : {
        src: query.status,
    })

    r.useLayoutEffect((): VoidFunction | void => {
        if (!nprop_status_disabled && query_status === asc.Query_Status.Idle) {
            query.load()

            return () => {
                query.clear()
            }
        }
    }, [query, nprop_status_disabled, query_status])

    return [
        query,
        node.data,
    ]
}
