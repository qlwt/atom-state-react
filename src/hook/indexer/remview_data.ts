import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export type UseIndexerRemViewData_Params<Ref extends asc.RemNode<any>, Filter> = {
    readonly filter: Filter
    readonly indexer: asc.IdxOutput<Ref, Filter>
}

export const useIndexerRemViewData = function <Ref extends asc.RemNode<any>, Filter>(
    params: UseIndexerRemViewData_Params<Ref, Filter>
): sc.OSignal<asc.RemView_Full<asc.RemNode_InferDef<Ref>>["data"][]> {
    const watcher = r.useMemo(() => {
        return params.indexer.filter(asc.indexer_fev_new(params.filter))
    }, [params.indexer, params.filter])

    return r.useMemo(() => {
        return sc.osignal_new_pipeflat(
            sc.osignal_new_listpipe(watcher, ref => {
                return sc.osignal_new_memo(sc.osignal_new_pipe(
                    asc.remview_new_node(ref),
                    remview => remview.data,
                ), null)
            }),
            list => sc.osignal_new_pipe(
                sc.osignal_new_merge(list),
                data_list => data_list.filter(data => data !== null)
            )
        )
    }, [watcher])
}
