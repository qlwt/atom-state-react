import { store_new } from "#src/util/store/new.js"
import { test } from "vitest"

const wait = function(time: number): Promise<void> {
    return new Promise(res => {
        setTimeout(res, time)
    })
}

test("basic operations", ({ expect }) => {
    const node_a = { id: "node_a" }
    const node_b = { id: "node_b" }

    const store = store_new()

    store.cleanupdelay_add(50)

    store.node_set(node_a.id, node_a)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)).toBe(null)

    store.node_set(node_b.id, node_b)

    expect(store.node_get(node_b.id)?.value).toBe(node_b)
})

test("forget", async ({ expect }) => {
    const node_a = { id: "node_a" }
    const node_b = { id: "node_b" }
    const node_c = { id: "node_c" }

    const store = store_new()

    store.cleanupdelay_add(50)

    store.node_set(node_a.id, node_a)
    store.node_set(node_b.id, node_b)
    store.node_set(node_c.id, node_c)

    store.limit_add(2)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)

    await wait(100)

    expect(store.node_get(node_a.id)).toBe(null)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
})

test("forget_adjustment_up", async ({ expect }) => {
    const node_a = { id: "node_a" }
    const node_b = { id: "node_b" }
    const node_c = { id: "node_c" }
    const node_d = { id: "node_d" }

    const store = store_new()

    store.cleanupdelay_add(50)

    store.node_set(node_a.id, node_a)
    store.node_set(node_b.id, node_b)
    store.node_set(node_c.id, node_c)
    store.node_set(node_d.id, node_d)

    const limit2_clean = store.limit_add(2)

    await wait(20)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)

    store.limit_add(3)

    limit2_clean()

    await wait(100)

    expect(store.node_get(node_a.id)).toBe(null)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)
})

test("forget_adjustment_down", async ({ expect }) => {
    const node_a = { id: "node_a" }
    const node_b = { id: "node_b" }
    const node_c = { id: "node_c" }
    const node_d = { id: "node_d" }

    const store = store_new()

    store.cleanupdelay_add(50)

    store.node_set(node_a.id, node_a)
    store.node_set(node_b.id, node_b)
    store.node_set(node_c.id, node_c)
    store.node_set(node_d.id, node_d)

    store.limit_add(3)

    await wait(20)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)

    store.limit_add(2)

    await wait(40)

    expect(store.node_get(node_a.id)).toBe(null)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)

    await wait(20)

    expect(store.node_get(node_a.id)).toBe(null)
    expect(store.node_get(node_b.id)).toBe(null)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)
})

test("forget_adjustment_null", async ({ expect }) => {
    const node_a = { id: "node_a" }
    const node_b = { id: "node_b" }
    const node_c = { id: "node_c" }
    const node_d = { id: "node_d" }

    const store = store_new()

    store.cleanupdelay_add(50)

    store.node_set(node_a.id, node_a)
    store.node_set(node_b.id, node_b)
    store.node_set(node_c.id, node_c)
    store.node_set(node_d.id, node_d)

    const limit_clear = store.limit_add(1)

    await wait(20)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)

    limit_clear()

    await wait(60)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)
})

test("require", async ({ expect }) => {
    const node_a = { id: "node_a" }
    const node_b = { id: "node_b" }
    const node_c = { id: "node_c" }
    const node_d = { id: "node_d" }

    const store = store_new()

    store.cleanupdelay_add(50)

    store.node_set(node_a.id, node_a)
    store.node_set(node_b.id, node_b)
    store.node_set(node_c.id, node_c)
    store.node_set(node_d.id, node_d)

    store.limit_add(3)

    await wait(20)

    store.node_require(node_a.id)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)

    await wait(40)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)

    await wait(20)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)).toBe(null)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)
})

test("require_beforelimit", async ({ expect }) => {
    const node_a = { id: "node_a" }
    const node_b = { id: "node_b" }
    const node_c = { id: "node_c" }
    const node_d = { id: "node_d" }

    const store = store_new()

    store.cleanupdelay_add(50)

    store.node_set(node_a.id, node_a)
    store.node_set(node_b.id, node_b)
    store.node_set(node_c.id, node_c)
    store.node_set(node_d.id, node_d)

    store.node_require(node_a.id)

    store.limit_add(3)

    await wait(20)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)

    await wait(40)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)).toBe(null)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)
})

test("require_adjust", async ({ expect }) => {
    const node_a = { id: "node_a" }
    const node_b = { id: "node_b" }
    const node_c = { id: "node_c" }
    const node_d = { id: "node_d" }

    const store = store_new()

    store.cleanupdelay_add(50)

    store.node_set(node_a.id, node_a)
    store.node_set(node_b.id, node_b)
    store.node_set(node_c.id, node_c)
    store.node_set(node_d.id, node_d)

    store.limit_add(3)

    await wait(20)

    const require_clear = store.node_require(node_a.id)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)

    await wait(40)

    require_clear()

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)

    await wait(20)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)).toBe(null)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)
})

test("require_overflow", async ({ expect }) => {
    const node_a = { id: "node_a" }
    const node_b = { id: "node_b" }
    const node_c = { id: "node_c" }
    const node_d = { id: "node_d" }

    const store = store_new()

    store.cleanupdelay_add(50)

    store.node_set(node_a.id, node_a)
    store.node_set(node_b.id, node_b)
    store.node_set(node_c.id, node_c)
    store.node_set(node_d.id, node_d)

    store.limit_add(2)

    await wait(20)

    store.node_require(node_a.id)
    store.node_require(node_b.id)
    store.node_require(node_d.id)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)?.value).toBe(node_c)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)

    await wait(60)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)).toBe(null)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)

    await wait(20)

    expect(store.node_get(node_a.id)?.value).toBe(node_a)
    expect(store.node_get(node_b.id)?.value).toBe(node_b)
    expect(store.node_get(node_c.id)).toBe(null)
    expect(store.node_get(node_d.id)?.value).toBe(node_d)
})
