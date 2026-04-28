import { useStore } from "#src/hook/atom/store.js"

export const useDispatch = function() {
    const store = useStore()

    return store.dispatch
}
