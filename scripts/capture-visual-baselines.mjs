import {
  acquireVisualBuildContext,
  createVisualBrowser,
  updateVisualBaselines,
  visualBaselineManifestPath,
} from '../tests/quality/visual-baselines.mjs'
import { relative } from 'node:path'
import { repositoryRoot } from '../tests/quality/helpers.mjs'

const valueAfter = (name) => {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

if (!process.argv.includes('--reviewed-update')) {
  console.error(
    'Refusing to update visual baselines without --reviewed-update, --reviewer, and --rationale',
  )
  process.exitCode = 2
} else {
  const reviewer = valueAfter('--reviewer')
  const rationale = valueAfter('--rationale')
  if (!reviewer || !rationale) {
    console.error('--reviewer and --rationale are required')
    process.exitCode = 2
  } else {
    const acquired = await acquireVisualBuildContext()
    const { browser, context } = await createVisualBrowser()
    try {
      const manifest = await updateVisualBaselines({
        builds: acquired.builds,
        context,
        rationale,
        reviewer,
      })
      console.log(
        `Captured ${manifest.scenarios.length} reviewed slide references in ${relative(repositoryRoot, visualBaselineManifestPath)}`,
      )
    } finally {
      await context.close()
      await browser.close()
      await acquired.close()
    }
  }
}
