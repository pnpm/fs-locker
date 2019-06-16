# @pnpm/fs-locker

> An fs locker for pnpm

<!--@shields('npm', 'travis')-->
[![npm version](https://img.shields.io/npm/v/@pnpm/fs-locker.svg)](https://www.npmjs.com/package/@pnpm/fs-locker) [![Build Status](https://img.shields.io/travis/pnpm/fs-locker/master.svg)](https://travis-ci.org/pnpm/fs-locker)
<!--/@-->

## Installation

```sh
<pnpm|yarn|npm> add @pnpm/fs-locker
```

## Usage

<!--@example('./example.js')-->
```js
'use strict'
const lock = require('@pnpm/fs-locker').default
const path = require('path')

const locks = path.resolve('_locks')

lock(process.cwd(), {stale: 100, locks})
  .then(unlock => {
    // do some stuff...
    return unlock() // or unlock.sync()
  })
  .then(() => {
    console.log('folder unlocked')
    //> folder unlocked
  })
  .catch(err => console.error(err))
```
<!--/@-->

## API

### `lock(filename, opts) => unlock[.sync]()`

Locks the specified file. Returns an async and sync unlock function.

#### Arguments

- `filename` - the file to lock
- `opts.stale` - duration in milliseconds in which the lock is considered stale
- `opts.locks` - the folder that contains the lock files
- `opts.whenLocked` - function that is called if a lock is found when trying to create the lock

## License

[MIT](./LICENSE) © [Zoltan Kochan](https://www.kochan.io/)
