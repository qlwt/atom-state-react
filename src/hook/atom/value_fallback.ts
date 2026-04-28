import { useStore } from "#src/hook/atom/store.js"
import type * as asc from "@qyu/atom-state-core"
import * as react from "react"

export type UseValueFallback_Params<T> = {
    readonly src: asc.Value_Atom<T> | null
}

export const useValueFallback = function <T, F>(fallback: F, params: UseValueFallback_Params<T> | null): T | F {
    const store = useStore()

    return react.useMemo(
        () => {
            if (params === null || params.src === null) {
                return fallback
            }

            return store.reg(params.src)
        },
        [params?.src ?? fallback, store]
    )
}
