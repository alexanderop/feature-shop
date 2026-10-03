import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { changedFiles } from '../../tools/git'

describe('real Git comparisons', () => {
  it('includes committed, staged, unstaged and untracked files locally but only committed files with --head', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'fieldwork-git-'))
    try {
      const git = (...args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      git('init', '-b', 'main')
      git('config', 'user.email', 'test@example.invalid')
      git('config', 'user.name', 'Verification fixture')
      mkdirSync(join(cwd, 'files'))
      writeFileSync(join(cwd, 'files/original.txt'), 'first\n')
      git('add', '.')
      git('commit', '-m', 'baseline')
      const base = git('rev-parse', 'HEAD').trim()
      git('mv', 'files/original.txt', 'files/renamed.txt')
      git('commit', '-m', 'rename')
      writeFileSync(join(cwd, 'files/staged.txt'), 'staged')
      git('add', 'files/staged.txt')
      writeFileSync(join(cwd, 'files/renamed.txt'), 'modified')
      writeFileSync(join(cwd, 'files/untracked.txt'), 'new')
      expect(changedFiles(cwd, base).files).toEqual(['files/original.txt', 'files/renamed.txt', 'files/staged.txt', 'files/untracked.txt'])
      expect(changedFiles(cwd, base, 'HEAD').files).toEqual(['files/original.txt', 'files/renamed.txt'])
      expect(changedFiles(cwd, 'missing').fallback).toBe('Git comparison unavailable; run all')
    } finally { rmSync(cwd, { recursive: true, force: true }) }
  })
})
