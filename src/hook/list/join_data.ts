import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export type UseListJoinData_Params<T, Output extends {}> = {
    readonly list: Iterable<T>
    readonly join: asc.Join<T, { readonly data?: Output | null | undefined }>
}

export const useListJoinData = function <T, Output extends {}>(
    params: UseListJoinData_Params<T, Output>
): sc.OSignal<readonly Output[]> | null {
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
                    root_listptr => {
                        if (root_listptr.kind === asc.Join_Option_Kind.None) {
                            return []
                        }

                        const result: Output[] = new Array(root_listptr.value.length)

                        let s = 0

                        for (let i = 0; i < root_listptr.value.length; ++i) {
                            const root_item = root_listptr.value[i]!

                            if (root_item.data) {
                                result[s++] = root_item.data
                            }
                        }

                        result.length = s

                        return result
                    }
                ),
                null
            )
        },
        [list_join, params.list]
    )
}
