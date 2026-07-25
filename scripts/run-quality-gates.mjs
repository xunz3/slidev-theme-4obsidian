import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { repositoryRoot } from '../tests/quality/helpers.mjs'

const arguments_ = process.argv.slice(2)
const updateBaselines = arguments_.includes('--update-baselines')
const updateVisualBaselines = arguments_.includes('--update-visual-baselines')
const updatePerformanceBaselines = arguments_.includes(
  '--update-performance-baselines',
)
const valueAfter = (name) => {
  const index = arguments_.indexOf(name)
  return index >= 0 ? arguments_[index + 1] : undefined
}
const requestedUpdates = [
  updateBaselines,
  updateVisualBaselines,
  updatePerformanceBaselines,
].filter(Boolean).length

if (requestedUpdates > 1) {
  console.error(
    'Choose exactly one baseline update mode: combined, visual, or performance.',
  )
  process.exitCode = 2
} else if (requestedUpdates > 0
  && (!valueAfter('--reviewer')?.trim() || !valueAfter('--rationale')?.trim())) {
  console.error(
    'Reviewed baseline updates require --reviewer "<name>" and --rationale "<approved reason>".',
  )
  process.exitCode = 2
} else {
  const child = spawn(
    process.execPath,
    [resolve(repositoryRoot, 'tests/quality/run.mjs'), ...arguments_],
    {
      cwd: repositoryRoot,
      stdio: 'inherit',
    },
  )
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => child.kill(signal))
  }
  process.exitCode = await new Promise((resolveExit) => {
    child.once('error', (error) => {
      console.error(error.message)
      resolveExit(2)
    })
    child.once('exit', (code, signal) => {
      if (signal) {
        console.error(`Quality process ended with ${signal}`)
        resolveExit(2)
      } else {
        resolveExit(code ?? 2)
      }
    })
  })
}
