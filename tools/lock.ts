import { closeSync, mkdirSync, openSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export class VerificationBusyError extends Error {}

export function acquireLock(cwd: string): () => void {
  const directory = join(cwd, '.verification')
  mkdirSync(directory, { recursive: true })
  const path = join(directory, 'active.lock')
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const descriptor = openSync(path, 'wx')
      try { writeFileSync(descriptor, String(process.pid)) } finally { closeSync(descriptor) }
      return () => { try { unlinkSync(path) } catch { /* A removed lock needs no cleanup. */ } }
    } catch (error) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'EEXIST') throw error
      let owner = 0
      try { owner = Number(readFileSync(path, 'utf8')) } catch { /* Another process may still be creating the lock. */ }
      if (!Number.isSafeInteger(owner) || owner < 1) throw new VerificationBusyError('Another verifier is starting. Retry after it finishes.')
      try { process.kill(owner, 0) } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ESRCH') {
          try { unlinkSync(path) } catch { /* Another verifier may have recovered the stale lock. */ }
          continue
        }
        throw new VerificationBusyError(`Cannot establish whether verifier ${owner} has stopped.`)
      }
      throw new VerificationBusyError(`Verifier ${owner} is already running. Wait for it to finish before starting another run.`)
    }
  }
  throw new VerificationBusyError('Could not acquire verification lock. Retry after the active run finishes.')
}
