import * as asc from "@qyu/atom-state-core"
import * as r from "react"

export type UsePaginatorPure_Params<Cursor> = {
    readonly deps_clear?: unknown[]
    readonly config?: asc.Paginator_NewPure_Config
    readonly init: () => asc.Paginator_NewPure_Init<Cursor>
    readonly request_new: asc.Paginator_NewPure_Params<Cursor>["request_new"]

    readonly status_noabort?: boolean
}

export const usePaginatorPure = function <Cursor>(params: UsePaginatorPure_Params<Cursor>): asc.PaginatorPure {
    const nprops_deps_clear = params.deps_clear ?? []
    const nprop_status_noabort = params.status_noabort ?? false

    const mref_cursor = r.useMemo(() => {
        return {
            current: params.init().cursor
        } as r.MutableRefObject<{ value: Cursor } | null>
    }, nprops_deps_clear)
    
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

    return paginator
}
