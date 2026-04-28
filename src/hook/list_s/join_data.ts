import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export type UseListSJoinData_Params<T, Output extends {}> = {
    readonly list: sc.OSignal<Iterable<T>>
    readonly join: asc.Join<T, { readonly data?: Output | null | undefined }>
}

export const useListSJoinData = function <T, Output extends {}>(
    params: UseListSJoinData_Params<T, Output>
): sc.OSignal<readonly Output[]> {
    const list_join = r.useMemo(() => asc.join_new_list({
        join: params.join,
    }), [params.join])

    return r.useMemo(
        () => {
            return sc.osignal_new_memo(
                sc.osignal_new_pipe(
                    list_join.prop(sc.osignal_new_memo(
                        sc.osignal_new_pipe(
                            params.list,
                            list => ({
                                kind: asc.Join_Option_Kind.View,
                                value: list
                            })
                        ),
                        null
                    )),
                    root_listptr => {
                        if (root_listptr.kind === asc.Join_Option_Kind.None) {
                            return []
                        }

                        const result = new Array<Output>(root_listptr.value.length)

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
