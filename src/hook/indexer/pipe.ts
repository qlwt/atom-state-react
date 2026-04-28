import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export type UseIndexerPipe_Params<Ref, Filter, OT> = {
    readonly filter: Filter
    readonly transformer: (value: Ref) => OT
    readonly indexer: asc.IdxOutput<Ref, Filter>
}

export const useIndexerPipe = function <Ref, Filter, OT>(
    params: UseIndexerPipe_Params<Ref, Filter, OT>
): sc.OSignal<OT[]> {
    const watcher = r.useMemo(() => {
        return params.indexer.filter(asc.indexer_fev_new(params.filter))
    }, [params.indexer, params.filter])

    return r.useMemo(() => {
        return sc.osignal_new_listpipe(watcher, ref => {
            return params.transformer(ref)
        })
    }, [watcher, params.transformer])
}
