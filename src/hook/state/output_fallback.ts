import { useStore } from "#src/hook/atom/store.js"
import type * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as sr from "@qyu/signal-react"
import * as r from "react"

export type UseStateOutputFallback_Params<T> = {
    readonly src: asc.Value_Atom<sc.OSignal<T>> | null

    readonly config?: sr.UseSignalOutput_Config<T>
}

export const useStateOutputFallback = function <T, F>(fallback: F, params: UseStateOutputFallback_Params<T> | null): F | T {
    const store = useStore()

    const src = r.useMemo(() => {
        if (params && params.src) {
            return store.reg(params.src)
        }

        return null
    }, [params?.src ?? fallback, store])

    return sr.useSignalOutputFallback(fallback, params && {
        src,
        config: params.config,
    })
}
