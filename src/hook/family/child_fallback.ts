import type * as asc from "@qyu/atom-state-core";
import * as react from "react";

export type UseFamilyChildFallback_Params<Index, V> = {
    readonly param: Index
    readonly family: asc.Family<Index, V> | null
}

export const useFamilyChildFallback = function <Index, V, F>(fallback: F, params: UseFamilyChildFallback_Params<Index, V> | null): V | F {
    return react.useMemo(
        () => {
            if (params && params.family) {
                return params.family.reg(params.param)
            }

            return fallback
        },
        [params?.family ?? fallback, params?.family ? params.param : fallback]
    )
}
