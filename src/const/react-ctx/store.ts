import * as react from "react"
import type * as asc from "@qyu/atom-state-core"

export const StoreContext = react.createContext<asc.Store | null>(null)
