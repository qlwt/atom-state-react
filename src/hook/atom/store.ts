import * as react from "react"
import type * as asc from "@qyu/atom-state-core"
import { AtomStoreContext } from "#src/const/react-ctx/store.js"

export const useAtomStore = function(): asc.AtomStore {
    const store = react.useContext(AtomStoreContext)

    if (store) {
        return store
    }

    throw new Error("Calling useAtomStore outside of store context")
}
