import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export const useListRemView = function <Def extends asc.RemNode_Def>(
    list: Iterable<asc.RemNode<Def>>
): sc.OSignal<readonly asc.RemView<Def>[]> | null {
    return r.useMemo(() => {
        const remviews_s = new Array<sc.OSignal<asc.RemView<Def>>>()

        for (const remnode of list) {
            remviews_s.push(sc.osignal_new_memo(
                asc.remview_new_node(remnode),
                null
            ))
        }

        return sc.osignal_new_memo(
            sc.osignal_new_merge(remviews_s),
            null
        )
    }, [list])
}
