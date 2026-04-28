import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export type UsePropJoin_Params<T, Output, Fallback> = {
    readonly prop: T
    readonly fallback: Fallback
    readonly join: asc.Join<T, Output>
}

export const usePropJoin = function <T, Output, Fallback>(
    params: UsePropJoin_Params<T, Output, Fallback>
): sc.OSignal<Output | Fallback> | null {
    return r.useMemo(
        () => {
            const root = params.join.root(params.prop)

            if (root.kind === asc.Join_Option_Kind.None) {
                return null
            }

            return sc.osignal_new_memo(
                sc.osignal_new_pipe(
                    sc.osignal_new_memo(root.value, null),
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
