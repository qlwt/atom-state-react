import type * as asc from "@qyu/atom-state-core"
import * as react from "react"

export type UseLoaderRequest_Params<Param> = {
    readonly param: Param
    readonly loader: asc.Loader<Param> | null

    readonly status_disabled?: boolean
}

export const useLoaderRequest = function <Param>(params: UseLoaderRequest_Params<Param> | null): void {
    const nprop_status_disabled = params?.status_disabled ?? false

    react.useEffect(
        (): VoidFunction | void => {
            if (params && params.loader && !nprop_status_disabled) {
                return params.loader.request(params.param)
            }
        },
        [params?.loader, params?.param, nprop_status_disabled]
    )
}
