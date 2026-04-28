import type * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as sr from "@qyu/signal-react"
import * as react from "react"

export type UseLoaderSRequestPure_Params = {
    readonly loader: sc.OSignal<asc.Loader<void> | null> | null

    readonly status_disabled?: boolean
}

export const useLoaderSRequestPure = function (params: UseLoaderSRequestPure_Params | null): void {
    const nprop_status_disabled = params?.status_disabled ?? false

    sr.useSignalEffect({
        target: params?.loader ?? null,

        config: {
            emit: true
        },

        listener: react.useCallback(
            (target: sc.OSignal<asc.Loader<void> | null>): VoidFunction | void => {
                const target_out = target.output()

                if (params && target_out && !nprop_status_disabled) {
                    return target_out.request()
                }
            },
            [nprop_status_disabled]
        )
    })
}
