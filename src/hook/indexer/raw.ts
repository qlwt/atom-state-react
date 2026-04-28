import * as asc from "@qyu/atom-state-core"
import * as r from "react"
import * as sc from "@qyu/signal-core"

export const useIndexerRaw = function <Ref, Filter>(
    indexer: asc.IdxOutput<Ref, Filter>, filter: Filter
): sc.OSignal<Ref[]> {
    const watcher = r.useMemo(() => {
        return indexer.filter(asc.indexer_fev_new(filter))
    }, [indexer, filter])

    return r.useMemo(() => {
        return sc.osignal_new_pipe(watcher, watcher_o => [...watcher_o])
    }, [watcher])
}
