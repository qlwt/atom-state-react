import * as asc from "@qyu/atom-state-core"
import * as sr from "@qyu/signal-react"
import * as r from "react"

export type UseQueryPure_Params = {
    readonly config?: asc.Query_NewPure_Config
    readonly deps_clear?: unknown[]
    readonly request_new: asc.Query_NewPure_Params["request_new"]

    readonly status_disabled?: boolean
}

export const useQueryPure = function(params: UseQueryPure_Params): asc.QueryPure {
    const nprop_deps_clear = params.deps_clear ?? []
    const nprop_status_disabled = params.status_disabled ?? false

    const mref_finished = r.useMemo(() => {
        return {
            current: false
        }
    }, nprop_deps_clear)

    const query = r.useMemo(() => {
        return asc.query_new_pure({
            config: params.config,
            status_finished: mref_finished.current,

            request_new: async api => {
                const result = await params.request_new(api)

                if (!api.signal_abort.aborted) {
                    mref_finished.current = result
                }

                return result
            },
        })
    }, [params.request_new, ...asc.query_new_pure__config_deps(params.config), mref_finished])

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

    return query
}
