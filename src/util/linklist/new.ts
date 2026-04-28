import type { LinkList } from "#src/util/linklist/type/linklist.js"

export const linklist_new = function <T>(): LinkList<T> {
    return {
        node_first: null,
        node_last: null,
        length: 0,
    }
}
