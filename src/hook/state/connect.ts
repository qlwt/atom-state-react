import { useValueFallback } from "#src/hook/atom/value_fallback.js"
import type * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as sr from "@qyu/signal-react"

export const useStateConnect = function <T>(
    src: asc.Value_Atom<sc.OSignal<T> | null> | null, config?: sr.UseSignalConnect_Config<T>
): sr.UseSignalConnect_Connection<T> {
    return sr.useSignalConnect(useValueFallback(null, { src }), config)
}
