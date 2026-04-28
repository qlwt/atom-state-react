import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export const usePropSRemView = function <Def extends asc.RemNode_Def>(
    prop: sc.OSignal<asc.RemNode<Def>>
): sc.OSignal<asc.RemView<Def>> {
    return r.useMemo(
        () => {
            return sc.osignal_new_memo(
                sc.osignal_new_pipeflat(prop, prop_out => {
                    return asc.remview_new_node( prop_out)
                }),
                null
            )
        },
        [prop]
    )
}
