import { useStore } from "#src/hook/atom/store.js"
import type * as asc from "@qyu/atom-state-core"
import * as react from "react"

export const useValue = function <T>(src: asc.Value_Atom<T>): T {
    const store = useStore()

    return react.useMemo(
        () => store.reg(src),
        [src, store]
    )
}
