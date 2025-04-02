import { useAtomValue } from "#src/hook/atom/value.js"
import type * as asc from "@qyu/atom-state-core"
import * as react from "react"

export type UseAtomLoader_Params<P extends readonly unknown[]> = {
    readonly params: P
    readonly atomloader: asc.AtomLoader<P>

    readonly request?: boolean
}

export const useAtomLoader = function <P extends readonly unknown[]>(params: UseAtomLoader_Params<P>): void {
    const { atomloader, params: atomloader_params, request = true } = params

    const loader = useAtomValue(atomloader)

    react.useEffect(
        (): VoidFunction | void => {
            if (request) {
                return loader.request(...atomloader_params)
            }
        },
        [atomloader, ...params.params, request]
    )
}
