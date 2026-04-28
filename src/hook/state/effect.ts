import { useValueFallback } from "#src/hook/atom/value_fallback.js"
import type * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as sr from "@qyu/signal-react"

export type UseStateEffect_Params<Target extends sc.OSignal> = {
    readonly target: asc.Value_Atom<Target | null> | null
    readonly listener: sc.Signal_Listen_Sub<Target>

    readonly config?: sc.Signal_Listen_Config
}

export const useStateEffect = function <Target extends sc.OSignal>(params: UseStateEffect_Params<Target>): void {
    const { target, config, listener } = params

    const target_value = useValueFallback(null, { src: target })

    sr.useSignalEffect({
        config,
        listener,

        target: target_value,
    })
}
