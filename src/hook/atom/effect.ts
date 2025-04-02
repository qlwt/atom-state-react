import { useAtomValue } from "#src/hook/atom/value.js"
import type * as asc from "@qyu/atom-state-core"
import * as sc from "@qyu/signal-core"
import * as sr from "@qyu/signal-react"

export type UseAtomEffect_Params<Target extends sc.OSignal> = {
    readonly target: asc.AtomValue<Target>
    readonly listener: sc.Signal_Listen_Sub<Target>

    readonly config?: sc.Signal_Listen_Config
}

export const useAtomEffect = function <Target extends sc.OSignal>(params: UseAtomEffect_Params<Target>): void {
    const { target, config, listener } = params

    const target_value = useAtomValue(target)

    sr.useSignalEffect({
        config,
        listener,

        target: target_value,
    })
}
