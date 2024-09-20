import { type EffectScope, effectScope, getCurrentScope, onScopeDispose } from 'vue'

function tryOnScopeDispose(fn: () => void) {
  if (getCurrentScope()) {
    onScopeDispose(fn)
    return true
  }
  return false
}

export interface CreateUniqueSharedComposableOptions {
  isGlobal?: boolean
}

/**
 * @param composable A composable function. The key passed to the composable when called
 * is used to distinguish multiple independent shared states, that means the same key will have
 * the same state
 * @param [options]
 *   @option `isGlobal`: if `true`, the reactive states will never be disposed. `false` by default
 *
 * @example
 *
```javascript
import { createUniqueSharedComposable } from 'create-unique-shared-composable'
const useFoo = createUniqueSharedComposable((_) => {
  const counter = ref(0)
  const doubled = computed(() => counter.value * 2)
  return {
    counter,
    doubled
  }
})

const { counter, doubled } = useFoo('key')
const { counter: counter1, doubled: doubled1 } = useFoo('key')
const { counter: counter2, doubled: doubled2 } = useFoo('key2')

counter.value++
console.log(counter.value) // 1
console.log(doubled.value) // 2

console.log(counter1.value) // 1
console.log(doubled1.value) // 2

console.log(counter1.value) // 0
console.log(doubled1.value) // 0
```
 */
export function createUniqueSharedComposable<Key extends string | number, ReturnValue>(
  composable: (key: Key) => ReturnValue,
  options: CreateUniqueSharedComposableOptions = {},
) {
  const { isGlobal = false } = options

  interface MapValue {
    subscriber: number
    state?: ReturnValue
    scope?: EffectScope
  }

  const map = new Map<Key, MapValue>()

  const getMapValue = (key: Key) => {
    let mv = map.get(key)
    if (!mv) {
      mv = { subscriber: 0 }
      map.set(key, mv)
    }
    return mv
  }

  const getItem = <K extends keyof MapValue>(
    key: Key,
    k: K,
  ) => getMapValue(key)[k]

  const setItem = <K extends keyof MapValue>(
    key: Key,
    k: K,
    value: MapValue[K],
  ) => {
    const mv = getMapValue(key)
    mv[k] = value
  }

  const incSubscriber = (key: Key) => {
    const s = getItem(key, 'subscriber')
    setItem(key, 'subscriber', s + 1)
  }
  const decSubscriber = (key: Key) => {
    const s = getItem(key, 'subscriber')
    setItem(key, 'subscriber', s - 1)
  }
  const isSubscriberEmpty = (key: Key) => {
    return getItem(key, 'subscriber') <= 0
  }

  const dispose = (key: Key) => {
    decSubscriber(key)
    const scope = getItem(key, 'scope')

    if (scope && isSubscriberEmpty(key)) {
      scope.stop()
      map.delete(key)
    }
  }

  return (key: Key) => {
    let state = getItem(key, 'state')

    if (!state) {
      const scope = effectScope(true)
      setItem(key, 'scope', scope)

      state = scope.run(() => composable(key)) as ReturnValue
      setItem(key, 'state', state)
    }

    if (!isGlobal) {
      incSubscriber(key)
      tryOnScopeDispose(() => dispose(key))
    }

    return state
  }
}
