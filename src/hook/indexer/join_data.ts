import * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as r from "react"

export type UseIndexerJoinData_Params<Ref extends asc.RemNode<any>, Filter, Output extends {}> = {
    readonly filter: Filter
    readonly indexer: asc.IdxOutput<Ref, Filter>
    readonly join: asc.Join<Ref, { readonly data: Output | null }>
}

export const useIndexerJoinData = function <Ref extends asc.RemNode<any>, Filter, Output extends {}>(
    params: UseIndexerJoinData_Params<Ref, Filter, Output>
): sc.OSignal<Output[]> {
    const watcher = r.useMemo(() => {
        return params.indexer.filter(asc.indexer_fev_new(params.filter))
    }, [params.indexer, params.filter])

    return r.useMemo(() => {
        return sc.osignal_new_memo(
            sc.osignal_new_pipeflat(
                sc.osignal_new_listpipe_pick(watcher, ref => {
                    const join_root = params.join.root(ref)

                    if (join_root.kind === asc.Join_Option_Kind.None) {
                        return {
                            pick: false
                        }
                    }

                    return {
                        pick: true,

                        value: sc.osignal_new_memo(join_root.value, null)
                    }
                }),
                slist => sc.osignal_new_pipe(
                    sc.osignal_new_merge(slist),
                    list => {
                        const result = new Array<Output>(list.length)

                        {
                            let s = 0

                            for (let i = 0; i < list.length; ++i) {
                                const list_node = list[i]!

                                if (list_node.kind === asc.Join_Option_Kind.View && list_node.value.data) {
                                    result[s++] = list_node.value.data
                                }
                            }

                            result.length = s
                        }

                        return result
                    }
                )
            ),
            null
        )
    }, [watcher])
}
