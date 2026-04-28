import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export const usePropRemViewData = function <Def extends asc.RemNode_Def>(
    prop: asc.RemNode<Def>
): sc.OSignal<asc.RemView_Full<Def>["data"] | null> {
    return r.useMemo(
        () => {
            return sc.osignal_new_memo(
                sc.osignal_new_pipe(
                    asc.remview_new_node(prop),
                    remview => {
                        return remview.data
                    }
                ),
                null
            )
        },
        [prop]
    )
}
