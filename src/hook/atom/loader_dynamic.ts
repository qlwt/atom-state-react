import { useAtomValue } from "#src/hook/atom/value.js"
import type * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as sr from "@qyu/signal-react"
import * as react from "react"

export type UseAtomLoaderDynamic_Params<P extends readonly unknown[]> = {
    readonly params: P
    readonly atomloader: asc.AtomValue<sc.OSignal<asc.AtomLoader_Value<P>>>

    readonly request?: boolean
}

export const useAtomLoaderDynamic = function <P extends readonly unknown[]>(params: UseAtomLoaderDynamic_Params<P>): void {
    const { atomloader, params: atomloader_params, request = true } = params

    sr.useSignalEffect({
        target: useAtomValue(atomloader),

        config: {
            emit: true
        },

        listener: react.useCallback(
            (target: sc.OSignal<asc.AtomLoader_Value<P>>): VoidFunction | void => {
                if (request) {
                    return target.output().request(...atomloader_params)
                }
            },
            [...atomloader_params, request]
        )
    })
}
