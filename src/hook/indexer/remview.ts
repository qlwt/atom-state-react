import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export type UseIndexerRemView_Params<Ref extends asc.RemNode<any>, Filter> = {
    readonly filter: Filter
    readonly indexer: asc.IdxOutput<Ref, Filter>
}

export const useIndexerRemView = function <Ref extends asc.RemNode<any>, Filter>(
    params: UseIndexerRemView_Params<Ref, Filter>
): sc.OSignal<asc.RemView<asc.RemNode_InferDef<Ref>>[]> {
    const watcher = r.useMemo(() => {
        return params.indexer.filter(asc.indexer_fev_new(params.filter))
    }, [params.indexer, params.filter])

    return r.useMemo(() => {
        return sc.osignal_new_pipeflat(
            sc.osignal_new_listpipe(watcher, ref => {
                return sc.osignal_new_memo(
                    asc.remview_new_node(ref),
                    null
                ) as sc.OSignal<asc.RemView<asc.RemNode_InferDef<Ref>>>
            }),
            list => sc.osignal_new_merge(list)
        )
    }, [watcher])
}
