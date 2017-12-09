import crypto = require('crypto')
import mkdirp = require('mkdirp-promise')
import path = require('path')
import lockfile = require('proper-lockfile')

async function delay (ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function lock (
  lockFilename: string,
  opts: {
    firstTime: boolean,
    stale: number,
    whenLocked?: () => void,
  },
): Promise<() => Promise<{}>> {
  const unlockThis = () => unlock(lockFilename)
  const promise = new Promise((resolve, reject) => {
    lockfile.lock(
      lockFilename,
      {realpath: false, stale: opts.stale},
      async (err: Error & {code: string}) => {
        if (err && err.code === 'ELOCKED') {
          if (opts.firstTime && opts.whenLocked) {
            opts.whenLocked()
          }
          await delay(200)
          await lock(lockFilename, {firstTime: false, stale: opts.stale, whenLocked: opts.whenLocked})
          resolve(unlockThis)
        } else if (err) {
          reject(err)
        } else {
          resolve(unlockThis)
        }
      })
  })
  return promise as Promise<() => Promise<{}>>
}

async function unlock (lockFilename: string): Promise<{}> {
  const promise = new Promise((resolve) =>
    lockfile.unlock(
      lockFilename,
      {realpath: false},
      resolve),
  )
  return promise as Promise<{}>
}

export default async function withLock<T> (
  dir: string,
  opts: {
    stale: number,
    locks: string,
    whenLocked?: () => void,
  },
): Promise<() => Promise<{}>> {
  dir = path.resolve(dir)
  await mkdirp(opts.locks)
  const lockFilename = path.join(opts.locks, crypto.createHash('sha1').update(dir).digest('hex'))
  return await lock(lockFilename, {firstTime: true, stale: opts.stale, whenLocked: opts.whenLocked})
}
