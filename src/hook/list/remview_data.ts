import * as sc from "@qyu/signal-core"
import * as asc from "@qyu/atom-state-core"
import * as r from "react"

export const useListRemViewData = function <Def extends asc.RemNode_Def>(
    list: Iterable<asc.RemNode<Def>>
): sc.OSignal<readonly asc.RemView_Full<Def>["data"][]> {
    return r.useMemo(() => {
        const remviews_s = new Array<sc.OSignal<asc.RemView<Def>>>()

        for (const remnode of list) {
            remviews_s.push(sc.osignal_new_memo(
                asc.remview_new_node(remnode),
                null
            ))
        }

        return sc.osignal_new_memo(sc.osignal_new_pipe(
            sc.osignal_new_merge(remviews_s),
            remviews => {
                const result = new Array<NonNullable<asc.RemView<Def>["data"]>>(remviews.length)

                {
                    let s = 0

                    for (let i = 0; i < remviews.length; ++i) {
                        const remview = remviews[i]!

                        if (remview.data) {
                            result[s++] = remview.data
                        }
                    }

                    result.length = s
                }

                return result
            }
        ), null)
    }, [list])
}
