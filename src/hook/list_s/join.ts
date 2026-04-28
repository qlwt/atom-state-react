import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export type UseListSJoin_Params<T, Output> = {
    readonly list: sc.OSignal<Iterable<T>>
    readonly join: asc.Join<T, Output>
}

export const useListSJoin = function <T, Output>(params: UseListSJoin_Params<T, Output>): sc.OSignal<readonly Output[]> {
    const list_join = r.useMemo(() => asc.join_new_list({
        join: params.join,
    }), [params.join])

    return r.useMemo(
        () => {
            return sc.osignal_new_memo(
                sc.osignal_new_pipe(
                    list_join.prop(sc.osignal_new_memo(sc.osignal_new_pipe(
                        params.list,
                        list => ({
                            kind: asc.Join_Option_Kind.View,
                            value: list
                        })
                    ), null)),
                    result => {
                        if (result.kind === asc.Join_Option_Kind.None) {
                            return []
                        }

                        return result.value
                    }
                ),
                null
            )
        },
        [list_join, params.list]
    )
}
