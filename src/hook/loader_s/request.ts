import type * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as sr from "@qyu/signal-react"
import * as react from "react"

export type UseLoaderSRequest_Params<Param> = {
    readonly param: Param
    readonly loader: sc.OSignal<asc.Loader<Param> | null> | null

    readonly status_disabled?: boolean
}

export const useLoaderSRequest = function <Param>(params: UseLoaderSRequest_Params<Param> | null): void {
    const nprop_status_disabled = params?.status_disabled ?? false

    sr.useSignalEffect({
        target: params?.loader ?? null,

        config: {
            emit: true
        },

        listener: react.useCallback(
            (target: sc.OSignal<asc.Loader<Param> | null>): VoidFunction | void => {
                const target_out = target.output()

                if (params && target_out && !nprop_status_disabled) {
                    return target_out.request(params.param)
                }
            },
            [params?.param, nprop_status_disabled]
        )
    })
}
