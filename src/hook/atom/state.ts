import { useAtomValue } from "#src/hook/atom/value.js"
import type * as asc from "@qyu/atom-state-core"
import { useSignalOutput } from "@qyu/signal-react"
import * as react from "react"

type Comaprator<T> = {
    (a: T, b: T): boolean
}

export type UseAtomState_Dispatch<I, O> = {
    (input: I): void
    (input: (output: O) => I): void
}


export type UseAtomState_Return<I, O> = [
    value: O,
    dispatch: UseAtomState_Dispatch<I, O>
]

export const useAtomState = function <I, O>(atomstate: asc.AtomState<I, O>, comparator: Comaprator<O> = Object.is): UseAtomState_Return<I, O> {
    const state = useAtomValue(atomstate)

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
