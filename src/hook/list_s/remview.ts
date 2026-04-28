import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export const useListSRemView = function <Def extends asc.RemNode_Def>(
    list: sc.OSignal<Iterable<asc.RemNode<Def>>>
): sc.OSignal<readonly asc.RemView<Def>[]> {
    return r.useMemo(() => {
        return sc.osignal_new_memo(
            sc.osignal_new_pipeflat(
                sc.osignal_new_listpipe(
                    list,
                    remnode => {
                        return sc.osignal_new_memo(
                            asc.remview_new_node(remnode),
                            null
                        )
                    }
                ),
                viewlist => sc.osignal_new_merge(viewlist)
            ),
            null
        )
    }, [list])
}
