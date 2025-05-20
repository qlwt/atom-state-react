# @qyu/atom-state-react

React bindings for @qyu/atom-state-core

## Connect Store Context

```tsx
const store = atomstore_new()

const root = <AtomStoreContext.Provider value={store}>
    <App />
</AtomStoreContext.Provider>
```

## Implemented Hooks

### useAtomStore

Returns Atom Store from closest context, throws if used outside of context

```tsx
const App = () => {
    const store = useAtomStore()
}
```

### useAtomDispatch

Returns dispatch function to run atom actions

```tsx
const App = () => {
    const dispatch = useAtomDispatch()
}
```

### useAtomValue

Get atomvalue from register or return value of selector

```tsx
const atomvalue = atomvalue_new(() => 10)

const App = () => {
    const value = useAtomValue(atomvalue)

    return <div>
        {value}
    </div>
}
```

### useAtomOutput

Same use useSignalOutput but used on atomvalue or atomselector

```tsx
const atomstate = atomstate_new(() => 10)

const App = () => {
    const value = useAtomOutput(atomstate)

    return <div>
        {value}

        <button onClick={() => { store.reg(atomstate).input(store.reg(atomstate).output() + 10) }}>
            Increase value
        </button>
    </div>
}
```

### useAtomConnect

Same as useSignalConnect but used on atomvalue or atomselector

```tsx
const atomstate = atomstate_new(() => 10)

const App = () => {
    const connection = useAtomConnect(atomstate)

    return <div>
        {connection.value /* will be null at first render, then changed to number */}

        <button onClick={() => { store.reg(atomstate).input(store.reg(atomstate).output() + 10) }}>
            Increase value
        </button>
    </div>
}
```

### useAtomState

Gets state from atom value in react's useState format

```tsx
const atomstate = atomstate_new(() => 10)

const App = () => {
    const [state, state_set] = useAtomState(atomstate)

    return <button onClick={() => { state_set(state_old => state_old + 10) }}>
        {state}
    </button>
}
```

### useAtomEffect

The same as useSignalEffect on @qyu/signal-core, but gets signal from provided selector or value

```tsx
const atomstate = atomstate_new(() => 10)

const App = () => {
    useAtomEffect({
        target: atomstate,

        config: {
            emit: true 
        },

        listener: useCallback((target: OSignal<number>) => {
            console.log(target.output())
        }, [])
    })
}
```

### useAtomChild

Get child of atomfamily

```tsx
const atomfamily = atomfamily_new({
    key: (a: number, b: number) => `${a} ${b}`,
    get: (a: number, b: number) => atomvalue_new(() => ({ a, b }))
})

const App = () => {
    const child = useAtomChild({ atomfamily, params: [10, 15] })

    return <div>
        a: {child.a} b: {child.b}
    </div>
}
```

### useAtomLoader

Request loader

```tsx
const atomloader = atomloader_new_pure({
    throttler: throttler_new_immediate(),

    connect: () => {
        console.log("connected")

        return () => {
            console.log("disconnected")
        }
    }
})

const App = () => {
    // request is optional, true by default
    // if true - request loader, if not - does not
    useAtomLoader({
        atomloader,
        params: [],
        request: true 
    })
}
```

### useAtomLoaderDynamic

Request loader inside of OSignal

```tsx
const atomloader1 = atomloader_new_pure({
    throttler: throttler_new_immediate(),

    connect: () => {
        console.log("connected1")

        return () => {
            console.log("disconnected1")
        }
    }
})

const atomloader2 = atomloader_new_pure({
    throttler: throttler_new_immediate(),

    connect: () => {
        console.log("connected2")

        return () => {
            console.log("disconnected2")
        }
    }
})

const atomstate = atomstate_new(() => store.reg(atomloader1))

const App = () => {
    // request is optional, true by default
    // if true - request loader, if not - does not
    useAtomLoaderDynamic({
        atomloader: atomstate,
        params: [],
        request: true 
    })
}
```
