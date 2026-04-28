import type * as asc from "@qyu/atom-state-core";
import * as react from "react";

export const useFamilyChild = function <Index, V>(family: asc.Family<Index, V>, param: Index): V {
    return react.useMemo(
        () => {
            return family.reg(param)
        },
        [family, param]
    )
}
