import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as sr from "@qyu/signal-react"
import * as r from "react"

export type UseQueryStateful_InitReturn<Data> = {
    readonly data: Data
}

export type UseQueryStateful_Params<Data> = {
    readonly init: () => UseQueryStateful_InitReturn<Data>

    readonly deps_clear?: unknown[]
    readonly status_disabled?: boolean
    readonly config?: asc.Query_NewPure_Config

    readonly request_new: asc.Query_NewPure_Request
}

export type UseQueryStateful_Return<Data> = [
    query: asc.QueryPure,
    data: sc.Signal<Data>
]

export const useQueryStateful = function <Data>(
    params: UseQueryStateful_Params<Data>
): UseQueryStateful_Return<Data> {
    const nprop_deps_clear = params.deps_clear ?? []
    const nprop_status_disabled = params.status_disabled ?? false

    const mref_finished = r.useMemo(() => {
        return {
            current: false
        }
    }, nprop_deps_clear)

    const data_list = r.useMemo(() => {
        return sc.signal_new_value<Data>(params.init().data)
    }, [...nprop_deps_clear])

    const query = r.useMemo(() => {
        return asc.query_new_pure({
            config: params.config,
            request_new: params.request_new,
            status_finished: mref_finished.current,
        })
    }, [params.request_new, mref_finished, ...asc.query_new_pure__config_deps(params.config)])

    const query_status = sr.useSignalOutputFallback(null, nprop_status_disabled ? null : {
        src: query.status,
    })

    r.useLayoutEffect((): VoidFunction | void => {
        if (!nprop_status_disabled && query_status === asc.Query_Status.Idle) {
            query.load()
        }
    }, [query, nprop_status_disabled, query_status])

    r.useLayoutEffect((): VoidFunction | void => {
        if (!nprop_status_disabled) {
            return () => {
                query.clear()
            }
        }
    }, [query, nprop_status_disabled])

    return [
        query,
        data_list,
    ]
}
