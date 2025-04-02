import { useAtomStore } from "#src/hook/atom/store.js"
import type * as asc from "@qyu/atom-state-core"
import * as react from "react"

export const useAtomValue = function <T>(src: asc.AtomValue<T>): T {
    const store = useAtomStore()

    return react.useMemo(
        () => store.reg(src),
        [src, store]
    )
}
