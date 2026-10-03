import { readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import ts from 'typescript'
import { features, featureIds, owners, type FeatureId } from './impact.ts'
import { filesUnder } from './scenarios.ts'

export function validateBoundaries(cwd: string): void {
  for (const path of [...filesUnder(join(cwd, 'app')), ...filesUnder(join(cwd, 'server'))]) {
    const file = relative(cwd, path)
    if (owners(file).length > 1) throw new Error(`Ambiguous feature ownership: ${file}`)
    const owner = owners(file)[0]
    if (!owner || !/\.(ts|vue)$/.test(path)) continue
    const raw = readFileSync(path, 'utf8')
    const text = path.endsWith('.vue') ? [...raw.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n') : raw
    const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true)
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue
      const specifier = statement.moduleSpecifier.text
      const target = specifier.startsWith('.') ? resolve(dirname(path), specifier)
        : specifier.startsWith('~/') ? join(cwd, 'app', specifier.slice(2))
        : specifier.startsWith('~~/') ? join(cwd, specifier.slice(3)) : undefined
      if (!target) continue
      const targetPath = relative(cwd, target)
      const imported = owners(targetPath)[0] ?? owners(`${targetPath}.ts`)[0] ?? owners(`${targetPath}/index.ts`)[0]
      if (imported && imported !== owner && !features[owner].dependsOn.includes(imported)) {
        throw new Error(`${file} imports ${imported} without declaring the dependency`)
      }
    }
  }
  for (const id of featureIds) {
    const visit = (current: FeatureId, trail: FeatureId[]) => {
      if (trail.includes(current)) throw new Error(`Feature dependency cycle: ${[...trail, current].join(' -> ')}`)
      features[current].dependsOn.forEach(next => visit(next, [...trail, current]))
    }
    visit(id, [])
  }
}
