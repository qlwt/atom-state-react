import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export type UsePropSJoin_Params<T, Output, Fallback> = {
    readonly fallback: Fallback
    readonly prop: sc.OSignal<T>
    readonly join: asc.Join<T, Output>
}

export const usePropSJoin = function <T, Output, Fallback>(
    params: UsePropSJoin_Params<T, Output, Fallback>
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

                        return result.value
                    }
                ),
                null
            )
        },
        [params.join, params.prop, params.fallback]
    )
}
