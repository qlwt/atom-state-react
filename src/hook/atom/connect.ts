import { useAtomValue } from "#src/hook/atom/value.js"
import type * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as sr from "@qyu/signal-react"

type Comparator<T> = {
    (a: T, b: T): boolean
}

export const useAtomConnect = function <T>(
    src: asc.AtomValue<sc.OSignal<T>>, comparator: Comparator<T> = Object.is
): sr.UseSignalConnect_Connection<T> {
    const src_value = useAtomValue(src)

    return sr.useSignalConnect(src_value, comparator)
}
