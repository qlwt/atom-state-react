import { useAtomStore } from "#src/hook/atom/store.js"
import type * as asc from "@qyu/atom-state-core"
import * as react from "react"

export type AtomDispatch = {
    (atomaction: asc.AtomAction): void
}

export const useAtomDispatch = function(): AtomDispatch {
    const store = useAtomStore()

    return react.useCallback(
        atomaction => {
            atomaction(store)
        },
        [store]
    )
}
