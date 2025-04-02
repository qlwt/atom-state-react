import { useAtomValue } from "#src/hook/atom/value.js";
import type * as asc from "@qyu/atom-state-core";
import * as react from "react";

type UseAtomChild_Params<P extends readonly unknown[], V> = {
    readonly params: P
    readonly atomfamily: asc.AtomFamily<P, V>
}

export const useAtomChild = function <P extends readonly unknown[], V>(params: UseAtomChild_Params<P, V>): V {
    const { atomfamily, params: atomfamily_params } = params

    const family = useAtomValue(atomfamily)

    return react.useMemo(
        () => {
            return family.reg(...atomfamily_params)
        },
        [family, ...atomfamily_params]
    )
}
