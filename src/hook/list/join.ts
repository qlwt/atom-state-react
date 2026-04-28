import * as sc from "@qyu/signal-core"
import * as asc from "@qyu/atom-state-core"
import * as r from "react"

export type UseListJoin_Params<T, Output> = {
    readonly list: Iterable<T>
    readonly join: asc.Join<T, Output>
}

export const useListJoin = function <T, Output>(params: UseListJoin_Params<T, Output>): sc.OSignal<readonly Output[]> | null {
    const list_join = r.useMemo(() => asc.join_new_list({
        join: params.join,
    }), [params.join])

    return r.useMemo(
        () => {
            const root = list_join.root(params.list)

            if (root.kind === asc.Join_Option_Kind.None) {
                return null
            }

            return sc.osignal_new_memo(
                sc.osignal_new_pipe(
                    sc.osignal_new_memo(root.value, null),
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
