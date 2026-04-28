import * as react from "react"
import type * as asc from "@qyu/atom-state-core"
import { StoreContext } from "#src/const/react-ctx/store.js"

export const useStore = function(): asc.Store {
    const store = react.useContext(StoreContext)

    if (store) {
        return store
    }

    throw new Error("Calling useStore outside of store context")
}
