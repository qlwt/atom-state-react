import * as react from "react"
import type * as asc from "@qyu/atom-state-core"

export const AtomStoreContext = react.createContext<asc.AtomStore | null>(null)
