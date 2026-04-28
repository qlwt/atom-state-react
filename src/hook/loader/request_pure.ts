import type * as asc from "@qyu/atom-state-core"
import * as react from "react"

export type UseLoaderRequestPure_Params = {
    readonly loader: asc.Loader<void> | null

    readonly status_disabled?: boolean
}

export const useLoaderRequestPure = function (params: UseLoaderRequestPure_Params | null): void {
    const nprop_status_disabled = params?.status_disabled ?? false

    react.useEffect(
        (): VoidFunction | void => {
            if (params && params.loader && !nprop_status_disabled) {
                return params.loader.request()
            }
        },
        [params?.loader, nprop_status_disabled]
    )
}
