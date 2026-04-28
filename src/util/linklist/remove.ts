import type { LinkList_Node } from "#src/util/linklist/type/linklist.js";

export const linklist_remove = function <T>(node: LinkList_Node<T>): void {
    const node_left = node.left
    const node_right = node.right
    const node_parent = node.parent

    if (node_parent) {
        node_parent.length -= 1

        {
            node.parent = null
            node.left = null
            node.right = null
        }

        if (node_parent.node_last === node) {
            node_parent.node_last = node_left
        }

        if (node_parent.node_first === node) {
            node_parent.node_first = node_right
        }
    }
}
