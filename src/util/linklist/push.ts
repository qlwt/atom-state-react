import type { LinkList, LinkList_Node } from "#src/util/linklist/type/linklist.js";

export const linklist_push = function <T>(list: LinkList<T>, node: LinkList_Node<T>): void {
    list.length += 1
    node.parent = list

    if (list.node_last === null) {
        list.node_first = node
        list.node_last = node
    } else {
        const last = list.node_last

        {
            list.node_last = node

            node.left = last

            last.right = node
        }
    }
}
