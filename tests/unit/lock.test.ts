import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { acquireLock } from '../../tools/lock'

it('rejects overlapping runs and allows a new run after cleanup', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'fieldwork-lock-'))
  try {
    const release = acquireLock(cwd)
    try { expect(() => acquireLock(cwd)).toThrow('already running') } finally { release() }
    const releaseNext = acquireLock(cwd)
    releaseNext()
  } finally { rmSync(cwd, { recursive: true, force: true }) }
})
