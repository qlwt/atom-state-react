import type { LinkList_Node } from "#src/util/linklist/type/linklist.js"

export type Store_MetaNode = {
    index: string
    require_amount: number
    cleanup_id: number | null
}

export type Store_Node<DataNode> = {
    index: string
    data: DataNode
    metanode_ptr: LinkList_Node<Store_MetaNode>
}

export type Store<DataNode> = {
    readonly node_entries: () => IterableIterator<readonly [string, DataNode]>
    readonly node_get: (index: string) => { value: DataNode } | null
    readonly node_set: (index: string, data_node: DataNode) => DataNode

    readonly limit_add: (limit: number) => VoidFunction
    readonly node_require: (index: string) => VoidFunction
    readonly cleanupdelay_add: (delay: number) => VoidFunction
}
