import { execFileSync } from 'node:child_process'

export function parseNameStatus(output: string): string[] {
  const fields = output.split('\0')
  const paths: string[] = []
  for (let index = 0; index < fields.length && fields[index];) {
    const status = fields[index++]!
    const count = /^[RC]/.test(status) ? 2 : 1
    for (let pathIndex = 0; pathIndex < count; pathIndex++) {
      const path = fields[index++]
      if (!path) throw new Error('Incomplete Git change record')
      paths.push(path)
    }
  }
  return paths
}

export function changedFiles(cwd: string, base = 'HEAD', head?: string): { files: string[]; fallback?: string; base: string; head: string } {
  const git = (args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  try {
    const baseSha = git(['rev-parse', '--verify', `${base}^{commit}`]).trim()
    const headSha = git(['rev-parse', '--verify', `${head ?? 'HEAD'}^{commit}`]).trim()
    const common = git(['merge-base', baseSha, headSha]).trim()
    const committed = parseNameStatus(git(['diff', '--name-status', '-z', '-M', common, headSha]))
    const local = head ? [] : [
      ...parseNameStatus(git(['diff', '--name-status', '-z', '-M', 'HEAD'])),
      ...git(['ls-files', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean),
    ]
    return { files: [...new Set([...committed, ...local])].sort(), base: baseSha, head: headSha }
  } catch {
    return { files: [], fallback: 'Git comparison unavailable; run all', base, head: head ?? 'working tree' }
  }
}
