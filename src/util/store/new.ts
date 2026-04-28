import { linklist_new } from "#src/util/linklist/new.js";
import { linklist_push } from "#src/util/linklist/push.js";
import { linklist_remove } from "#src/util/linklist/remove.js";
import type { LinkList, LinkList_Node } from "#src/util/linklist/type/linklist.js";
import type { Store, Store_MetaNode, Store_Node } from "#src/util/store/type/store.js";

type NodeCleanup_Params = {
    readonly node_map: Map<string, any>
    readonly metanode_ptr: LinkList_Node<Store_MetaNode>
}

const node_cleanup = function(params: NodeCleanup_Params) {
    params.node_map.delete(params.metanode_ptr.value.index)
    linklist_remove(params.metanode_ptr)
}

type NodeCleanupSchedule_Params = {
    readonly cleanupdelay: number
    readonly node_map: Map<string, any>
    readonly metanode_ptr: LinkList_Node<Store_MetaNode>
}

const node_cleanup_schedule = function(params: NodeCleanupSchedule_Params): number {
    return setTimeout(() => {
        node_cleanup({
            node_map: params.node_map,
            metanode_ptr: params.metanode_ptr,
        })
    }, params.cleanupdelay)
}

type Limit_AdjustDown_Params = {
    readonly limit: number
    readonly cleanupdelay: number
    readonly node_map: Map<string, any>
    readonly meta_sleep: LinkList<Store_MetaNode>
    readonly meta_active: LinkList<Store_MetaNode>
    readonly meta_cleanup: LinkList<Store_MetaNode>
}

const limit_adjust_tighten = function(params: Limit_AdjustDown_Params) {
    const store_spacetaken = params.meta_active.length + params.meta_sleep.length
    const overflow = store_spacetaken - params.limit

    for (let i = 0; i < overflow && params.meta_sleep.node_first; ++i) {
        const sleep_first = params.meta_sleep.node_first

        linklist_remove(sleep_first)
        linklist_push(params.meta_cleanup, sleep_first)

        sleep_first.value.cleanup_id = node_cleanup_schedule({
            node_map: params.node_map,
            metanode_ptr: sleep_first,
            cleanupdelay: params.cleanupdelay,
        })
    }
}

type Limit_AdjustUp_Params = {
    readonly limit: number
    readonly node_map: Map<string, any>
    readonly meta_sleep: LinkList<Store_MetaNode>
    readonly meta_active: LinkList<Store_MetaNode>
    readonly meta_cleanup: LinkList<Store_MetaNode>
}

const limit_adjust_loosen = function(params: Limit_AdjustUp_Params) {
    const store_spacetaken = params.meta_active.length + params.meta_sleep.length
    const extraspace = params.limit - store_spacetaken

    for (let i = 0; i < extraspace && params.meta_cleanup.node_last; ++i) {
        const cleanup_last = params.meta_cleanup.node_last

        linklist_remove(cleanup_last)
        linklist_push(params.meta_sleep, cleanup_last)

        clearTimeout(cleanup_last.value.cleanup_id!)
        cleanup_last.value.cleanup_id = null
    }
}

type Limit_AdjustNone_Params = {
    readonly meta_sleep: LinkList<Store_MetaNode>
    readonly meta_cleanup: LinkList<Store_MetaNode>
}

const limit_adjust_none = function(params: Limit_AdjustNone_Params) {
    while (params.meta_cleanup.node_first) {
        const cleanup_first = params.meta_cleanup.node_first

        linklist_remove(cleanup_first)
        linklist_push(params.meta_sleep, cleanup_first)

        clearTimeout(cleanup_first.value.cleanup_id!)
        cleanup_first.value.cleanup_id = null
    }
}

export const store_new = function <DataNode>(): Store<DataNode> {
    // expected to be the lowest number from limit_list
    // or null if limit_list is empty
    let limit: number | null = null
    // expected to be the highest number from cleanupdelay_list
    // or null if cleanupdelay_list is empty
    let cleanupdelay: number | null = null

    const limit_list = new Array<number>()
    const cleanupdelay_list = new Array<number>()
    const node_map = new Map<string, Store_Node<DataNode>>()

    const meta_cleanup = linklist_new<Store_MetaNode>()
    const meta_sleep = linklist_new<Store_MetaNode>()
    const meta_active = linklist_new<Store_MetaNode>()

    return {
        node_require: index => {
            let called = false

            {
                const node = node_map.get(index)

                if (node) {
                    const { metanode_ptr } = node
                    const { value: metanode } = metanode_ptr

                    metanode.require_amount += 1

                    if (metanode_ptr.parent === meta_cleanup) {
                        {
                            clearTimeout(metanode.cleanup_id!)

                            metanode.cleanup_id = null
                        }

                        linklist_remove(metanode_ptr)
                        linklist_push(meta_active, metanode_ptr)

                        if (typeof limit === "number" && typeof cleanupdelay === "number") {
                            limit_adjust_tighten({
                                limit,
                                cleanupdelay,
                                node_map,
                                meta_sleep,
                                meta_active,
                                meta_cleanup,
                            })
                        }
                    } else if (metanode_ptr.parent !== meta_active) {
                        linklist_remove(metanode_ptr)
                        linklist_push(meta_active, metanode_ptr)
                    }
                }
            }

            return () => {
                if (called) { return } else {
                    called = true
                }

                const node = node_map.get(index)

                if (node) {
                    const { metanode_ptr } = node
                    const { value: metanode } = metanode_ptr

                    metanode.require_amount -= 1

                    if (metanode.require_amount === 0) {
                        if (typeof limit === "number" && typeof cleanupdelay === "number" && meta_sleep.length + meta_active.length >= limit) {
                            linklist_remove(metanode_ptr)
                            linklist_push(meta_cleanup, metanode_ptr)

                            metanode.cleanup_id = node_cleanup_schedule({
                                node_map,
                                metanode_ptr,
                                cleanupdelay: cleanupdelay,
                            })
                        } else {
                            linklist_remove(metanode_ptr)
                            linklist_push(meta_sleep, metanode_ptr)
                        }
                    }
                }
            }
        },

        node_entries: function*(): IterableIterator<readonly [string, DataNode]> {
            for (const entry of node_map.entries()) {
                yield [entry[0], entry[1].data]
            }
        },

        node_get: (index) => {
            const node = node_map.get(index)

            if (node) {
                return {
                    value: node.data
                }
            }

            return null
        },

        node_set: (index, data_node) => {
            const metanode: Store_MetaNode = {
                index,
                cleanup_id: null,
                require_amount: 0,
            }

            const metanode_ptr: LinkList_Node<Store_MetaNode> = {
                left: null,
                right: null,
                parent: null,
                value: metanode,
            }

            if (typeof limit === "number" && typeof cleanupdelay === "number" && meta_sleep.length + meta_active.length > limit) {
                linklist_push(meta_cleanup, metanode_ptr)

                metanode.cleanup_id = node_cleanup_schedule({
                    node_map,
                    metanode_ptr,
                    cleanupdelay: cleanupdelay,
                })
            } else {
                linklist_push(meta_sleep, metanode_ptr)
            }

            const node: Store_Node<DataNode> = {
                index,
                metanode_ptr,
                data: data_node
            }

            node_map.set(index, node)

            return node.data
        },

        // this function is not expected to be called often
        // and limit_list is expected to only have one or two values
        limit_add: l_limit => {
            let called = false

            limit_list.push(l_limit)

            if (limit === null || l_limit < limit) {
                limit = l_limit

                if (typeof cleanupdelay === "number") {
                    limit_adjust_tighten({
                        limit,
                        cleanupdelay,
                        meta_cleanup,
                        meta_sleep,
                        meta_active,
                        node_map,
                    })
                }
            }

            return () => {
                if (called) { return } else {
                    called = true
                }

                // indexOf is guaranteed to be >= 0
                limit_list.splice(limit_list.indexOf(l_limit), 1)

                if (l_limit === limit) {
                    if (limit_list.length === 0) {
                        limit = null

                        limit_adjust_none({
                            meta_sleep,
                            meta_cleanup,
                        })
                    } else {
                        limit = Math.min.apply(Math, limit_list)

                        if (typeof cleanupdelay === "number") {
                            limit_adjust_loosen({
                                meta_cleanup,
                                meta_sleep,
                                meta_active,
                                node_map,
                                limit,
                            })
                        }
                    }
                }
            }
        },

        cleanupdelay_add: l_cleanupdelay => {
            let called = false

            cleanupdelay_list.push(l_cleanupdelay)

            if (cleanupdelay === null) {
                cleanupdelay = l_cleanupdelay

                if (typeof limit === "number") {
                    limit_adjust_tighten({
                        limit,
                        cleanupdelay,
                        node_map,
                        meta_sleep,
                        meta_active,
                        meta_cleanup,
                    })
                }
            } else if (l_cleanupdelay > cleanupdelay) {
                cleanupdelay = l_cleanupdelay
            }

            return () => {
                if (called === false) { return } else {
                    called = true
                }

                // indexOf is guaranteed to be >= 0
                cleanupdelay_list.splice(cleanupdelay_list.indexOf(l_cleanupdelay), 1)

                if (l_cleanupdelay === cleanupdelay) {
                    if (cleanupdelay_list.length === 0) {
                        cleanupdelay = null

                        // put cleanup nodes to sleep
                        while (meta_cleanup.node_last) {
                            const cleanup_last = meta_cleanup.node_last

                            linklist_remove(cleanup_last)
                            linklist_push(meta_sleep, cleanup_last)

                            clearTimeout(cleanup_last.value.cleanup_id!)
                            cleanup_last.value.cleanup_id = null
                        }
                    } else {
                        cleanupdelay = Math.max.apply(Math, cleanupdelay_list)
                    }
                }
            }
        }
    }
}
