'use strict'
const lock = require('@pnpm/fs-locker').default
const path = require('path')

const locks = path.resolve('_locks')

lock(process.cwd(), {stale: 100, locks})
  .then(unlock => {
    // do some stuff...
    return unlock()
  })
  .then(() => {
    console.log('folder unlocked')
  })
  .catch(err => console.error(err))
