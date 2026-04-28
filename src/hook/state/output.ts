import { useValue } from "#src/hook/atom/value.js"
import type * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as sr from "@qyu/signal-react"

export const useStateOutput = function <T>(src: asc.Value_Atom<sc.OSignal<T>>, config?: sr.UseSignalOutput_Config<T>): T {
    const src_value = useValue(src)

    return sr.useSignalOutput(src_value, config)
}
