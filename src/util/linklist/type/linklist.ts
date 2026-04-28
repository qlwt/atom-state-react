export type LinkList<T> = {
    length: number
    node_last: LinkList_Node<T> | null
    node_first: LinkList_Node<T> | null
}

export type LinkList_Node<T> = {
    value: T
    parent: LinkList<T> | null
    left: LinkList_Node<T> | null
    right: LinkList_Node<T> | null
}
