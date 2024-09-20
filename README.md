![GitHub License](https://img.shields.io/github/license/GloryWong/createUniqueSharedComposable)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/GloryWong/createUniqueSharedComposable)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/GloryWong/createUniqueSharedComposable/release.yml)
![GitHub Release](https://img.shields.io/github/v/release/GloryWong/createUniqueSharedComposable)
![GitHub Release Date](https://img.shields.io/github/release-date/GloryWong/createUniqueSharedComposable)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/GloryWong/createUniqueSharedComposable)
![GitHub watchers](https://img.shields.io/github/watchers/GloryWong/createUniqueSharedComposable)
![GitHub forks](https://img.shields.io/github/forks/GloryWong/createUniqueSharedComposable)
![GitHub Repo stars](https://img.shields.io/github/stars/GloryWong/createUniqueSharedComposable)
![NPM Version](https://img.shields.io/npm/v/create-unique-shared-composable)
![NPM Type Definitions](https://img.shields.io/npm/types/create-unique-shared-composable)
![NPM Downloads](https://img.shields.io/npm/dw/create-unique-shared-composable)
![Node Current](https://img.shields.io/node/v/create-unique-shared-composable)

# createUniqueSharedComposable

Create Vue3 unique shared composables based on keys.

This is similar to the [createSharedComposable](https://vueuse.org/shared/createSharedComposable/) and [createGlobalStates](https://vueuse.org/shared/createGlobalState/) of [vueuse](https://vueuse.org/), however, uses keys to create independent shared states.

## Install

Using pnpm:

```bash
pnpm add create-unique-shared-composable
```

Using yarn:

```bash
yarn add create-unique-shared-composable
```

Using npm:

```bash
npm install create-unique-shared-composable
```

## Usage

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

## Authors

👤 **GloryWong**

* Website: https://glorywong.com
* GitHub: [@GloryWong](https://github.com/GloryWong)

## Show Your Support

Give a ⭐️ if this project helped you!
