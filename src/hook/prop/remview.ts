import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export const usePropRemView = function <Def extends asc.RemNode_Def>(
    prop: asc.RemNode<Def>
): sc.OSignal<asc.RemView<Def>> {
    return r.useMemo(
        () => {
            return sc.osignal_new_memo(
                asc.remview_new_node(prop),
                null
            )
        },
        [prop]
    )
}
