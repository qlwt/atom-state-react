import { useValue } from "#src/hook/atom/value.js"
import type * as asc from "@qyu/atom-state-core"
import { useSignalOutput } from "@qyu/signal-react"
import * as react from "react"

type Comparator<T> = {
    (a: T, b: T): boolean
}

export type UseStateControls_Config<T> = {
    readonly comparator?: Comparator<T>
}

export type UseStateControls_Dispatch<I, O> = {
    (input: I): void
    (input: (output: O) => I): void
}

export type UseStateControls_Return<I, O> = [
    value: O,
    dispatch: UseStateControls_Dispatch<I, O>
]

export const useStateControls = function <I, O>(
    state_atom: asc.State_Atom<I, O>, config?: UseStateControls_Config<O>
): UseStateControls_Return<I, O> {
    const state = useValue(state_atom)
    const comparator = config?.comparator ?? Object.is

    return [
        useSignalOutput(state, comparator),
        react.useCallback(
            input => {
                if (typeof input === "function") {
                    state.input(
                        (input as (output: O) => I)(state.output())
                    )
                } else {
                    state.input(input)
                }
            },
            [state]
        )
    ]
}
