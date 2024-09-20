import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, effectScope, ref, watch } from 'vue'
import { createUniqueSharedComposable } from './index'

/*
 * NOTE: since v3.5, `computed` no longer uses effect,
 * see https://github.com/vuejs/core/issues/11886#issuecomment-2348643106
 *
 * So no need to test computed disposing. So from that version on,
 * only `watch` and `watchEffect` need to be disposed by their scopes intentionally.
 */

function runVueSetup<T>(setup: () => T) {
  const Comp = defineComponent({
    template: '<div></div>',
    setup,
  })

  return mount(Comp)
}

function createTestComposable(isGlobal?: boolean) {
  return createUniqueSharedComposable((id: string) => {
    const counter = ref(1)
    const doubled = ref(0)
    watch(counter, val => doubled.value = val * 2, { immediate: true })

    return {
      id,
      counter,
      doubled,
    }
  }, { isGlobal })
}

describe('createUniqueSharedComposable', () => {
  it('should share the states among the composables of the same key', async () => {
    const useFoo = createTestComposable()

    const { counter, doubled } = useFoo('key')
    const { counter: counter1 } = useFoo('key')

    expect(counter.value).toBe(1)
    expect(doubled.value).toBe(2)

    counter1.value += 1
    await flushPromises()
    expect(counter.value).toBe(2)
    expect(doubled.value).toBe(4)
  })

  it('should not share the states among the composables of different keys', async () => {
    const useFoo = createTestComposable()

    const { counter, doubled } = useFoo('key')
    const { counter: counter1, doubled: doubled1 } = useFoo('key1')

    expect(counter.value).toBe(1)
    expect(doubled.value).toBe(2)

    counter1.value += 1
    await flushPromises()
    expect(counter.value).toBe(1)
    expect(doubled.value).toBe(2)
    expect(counter1.value).toBe(2)
    expect(doubled1.value).toBe(4)
  })

  it('should dispose reactive effects by default', async () => {
    const useFoo = createTestComposable()
    const vm = runVueSetup(() => useFoo('key'))

    const scope = effectScope(true)
    const { counter, doubled } = scope.run(() => useFoo('key'))!

    counter.value += 1
    await flushPromises()
    expect(counter.value).toBe(2)
    expect(doubled.value).toBe(4)

    vm.unmount()
    scope.stop()

    counter.value += 1
    await flushPromises()
    expect(counter.value).toBe(3)
    expect(doubled.value).toBe(4)
  })

  it('should not dispose reactive effects when is set global', async () => {
    const useFoo = createTestComposable(true)
    const vm = runVueSetup(() => useFoo('key'))

    const scope = effectScope(true)
    const { counter, doubled } = scope.run(() => useFoo('key'))!

    counter.value += 1
    await flushPromises()
    expect(counter.value).toBe(2)
    expect(doubled.value).toBe(4)

    vm.unmount()
    scope.stop()

    counter.value += 1
    await flushPromises()
    expect(counter.value).toBe(3)
    expect(doubled.value).toBe(6)
  })
})
