import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export type UsePaginatorStateful_Init<Cursor, Data> = {
    readonly data: Data
    readonly cursor: Cursor
}

export type UsePaginatorStateful_Params<Cursor, Data> = {
    readonly config?: asc.Paginator_NewPure_Config
    readonly init: UsePaginatorStateful_Init<Cursor, Data>

    readonly deps_clear?: any[]
    readonly status_noabort?: boolean

    readonly request_new: asc.Paginator_NewPure_Request<Cursor>
}

export type UsePaginatorStateful_Return<Data> = [
    paginator: asc.PaginatorPure,
    data_list: sc.Signal<Data>
]

export const usePaginatorStateful = function <Cursor, Data>(
    params: UsePaginatorStateful_Params<Cursor, Data>
): UsePaginatorStateful_Return<Data> {
    const nprop_deps_clear = params.deps_clear ?? []
    const nprop_status_noabort = params.status_noabort ?? false

    const mref_cursor = r.useMemo(() => {
        return {
            current: params.init.cursor
        } as r.MutableRefObject<{ value: Cursor } | null>
    }, nprop_deps_clear)

    const data_list = r.useMemo(() => {
        return sc.signal_new_value<Data>(params.init.data)
    }, [mref_cursor])

    const paginator = r.useMemo(() => {
        return asc.paginator_new_pure({
            config: params.config,
            request_new: params.request_new,

            init: {
                cursor: mref_cursor.current,
            },
        })
    }, [params.request_new, mref_cursor, ...asc.paginator_new_pure__config_deps(params.config)])

    r.useLayoutEffect((): VoidFunction | void => {
        if (!nprop_status_noabort) {
            return () => {
                paginator.clear()
            }
        }
    }, [nprop_status_noabort, paginator])

    return [
        paginator,
        data_list,
    ]
}
