import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export type UsePropSJoinData_Params<T, Output extends {}, Fallback> = {
    readonly fallback: Fallback
    readonly prop: sc.OSignal<T>
    readonly join: asc.Join<T, { readonly data?: Output | null | undefined }>
}

export const usePropSJoinData = function <T, Output extends {}, Fallback>(
    params: UsePropSJoinData_Params<T, Output, Fallback>
): sc.OSignal<Output | Fallback> {
    return r.useMemo(
        () => {
            const result_s = params.join.prop(sc.osignal_new_pipe(
                params.prop,
                prop_out => {
                    return {
                        kind: asc.Join_Option_Kind.View,
                        value: prop_out
                    }
                }
            ))

            return sc.osignal_new_memo(
                sc.osignal_new_pipe(
                    sc.osignal_new_memo(result_s, null),
                    result => {
                        if (result.kind === asc.Join_Option_Kind.None) {
                            return params.fallback
                        }

                        if (result.value.data) {
                            return result.value.data
                        }

                        return params.fallback
                    }
                ),
                null
            )
        },
        [params.join, params.prop, params.fallback]
    )
}
