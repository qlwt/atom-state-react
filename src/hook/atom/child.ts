import { useAtomValue } from "#src/hook/atom/value.js";
import type * as asc from "@qyu/atom-state-core";
import * as react from "react";

type UseAtomChild_Params<Index, V> = {
    readonly params: Index
    readonly atomfamily: asc.AtomFamily<Index, V>
}

export const useAtomChild = function <Index, V>(params: UseAtomChild_Params<Index, V>): V {
    const { atomfamily, params: atomfamily_params } = params

    const family = useAtomValue(atomfamily)

    return react.useMemo(
        () => {
            return family.reg(atomfamily_params)
        },
        [family, atomfamily_params]
    )
}
