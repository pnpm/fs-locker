import crypto = require('crypto')
import makeDir = require('make-dir')
import path = require('path')
import lockfile = require('proper-lockfile')

export default async function withLock<T> (
  dir: string,
  opts: {
    stale: number,
    locks: string,
    whenLocked?: () => void,
  },
): Promise<(() => Promise<void>) & { sync: () => void }> {
  dir = path.resolve(dir)
  await makeDir(opts.locks)
  const lockFilename = path.join(opts.locks, crypto.createHash('sha1').update(dir).digest('hex'))
  return await lock(lockFilename, {
    firstTime: true,
    stale: opts.stale,
    whenLocked: opts.whenLocked,
  })
}

async function lock (
  lockFilename: string,
  opts: {
    firstTime: boolean,
    stale: number,
    whenLocked?: () => void,
  },
): Promise<(() => Promise<void>) & { sync: () => void }> {
  try {
    await lockfile.lock(
      lockFilename,
      { realpath: false, stale: opts.stale },
    )
    async function unlockThis () {
      try {
        await lockfile.unlock(lockFilename, { realpath: false })
      } catch (err) {
        // We don't care if the folder was not locked or already unlocked
        if (err.code !== 'ENOTACQUIRED') throw err
      }
    }
    unlockThis['sync'] = function unlockSync () { // tslint:disable-line
      try {
        lockfile.unlockSync(lockFilename, { realpath: false })
      } catch (err) {
        // We don't care if the folder was not locked or already unlocked
        if (err.code !== 'ENOTACQUIRED') throw err
      }
    }
    return unlockThis as (() => Promise<void>) & { sync: () => void }
  } catch (err) {
    if (err.code !== 'ELOCKED') throw err

    if (opts.firstTime && opts.whenLocked) {
      opts.whenLocked()
    }
    await delay(200)
    return await lock(lockFilename, {
      firstTime: false,
      stale: opts.stale,
      whenLocked: opts.whenLocked,
    })
  }
}

async function delay (ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
