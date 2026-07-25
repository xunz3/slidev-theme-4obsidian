# Phase 0 Research: Expand Theme Content

This research resolves every technical question for the public component/layout surface,
slide-local configuration, compatibility, accessibility, and release evidence.

## 1. Public and Private Vue Surface

**Decision**: Keep exactly `Callout`, `Figure`, `Authors`, `Steps`, `Timeline`, `Tag`, `Badge`,
and `Kbd` under `components/`. Keep shared layout implementation SFCs under a new top-level
`internals/` directory and add that directory to `package.json.files`.

**Rationale**: Slidev recursively auto-registers a theme's `components/` and `layouts/` trees.
A helper under either tree would accidentally become a public authoring interface. A shipped
directory outside both trees remains directly importable by the five public layout modules
without enlarging the component or layout contract. This follows Slidev's documented
[component](https://sli.dev/guide/component) and [layout](https://sli.dev/guide/layout)
discovery behavior.

**Alternatives considered**: `components/internal/` and `layouts/internal/` were rejected
because both are still auto-scanned. Manual app registration was rejected because the standard
theme discovery mechanism already covers every intended public component.

## 2. Dependency and Rendering Architecture

**Decision**: Implement the feature with the existing Slidev 52.15.2, Vue 3.5.34, TypeScript,
and CSS stack. Add no runtime dependency, remote resource, or theme-owned binary asset. Continue
to render every layout through `components/SlideFrame.vue`.

**Rationale**: Vue slots, native HTML, the current presentation resolver, and the existing
Playwright/Axe quality harness cover the feature. The shared frame already scopes preset,
density, accent, chrome, and branding to each rendered slide, including preview/export cases
where multiple slides coexist.

**Alternatives considered**: A component library would add bundle and styling risk without a
missing capability. Preset-specific components or layout copies would violate the shared
render-tree rule. Moving Obsidian parsing into the theme would cross the repository's
conversion/rendering boundary.

## 3. Slide and Deck Context

**Decision**: Use Slidev's `useSlideContext()` in components and layouts. Read authors from
`$slidev.configs.authors`, with the existing singular `author` compatibility fallback, and read
local metadata from the instance's reactive `$frontmatter`.

**Rationale**: `$frontmatter` belongs to the rendered slide instance, whereas global navigation
frontmatter can identify the wrong slide in presenter preview, overview, or export. The existing
`SlideFrame.vue` and `cover.vue` already use this public context pattern. See
[Slidev global context](https://sli.dev/guide/global-context).

**Alternatives considered**: Importing global `configs` is retained only for deck-wide setup;
it cannot resolve a rendered slide instance. Passing every metadata value through each layout
would duplicate the central resolver.

## 4. Callout Compatibility

**Decision**: `Callout` will emit an `<aside role="note">` with the existing
`.obsidian-slidev-callout`, title, content, supported modifier, and `data-callout` contract.
Canonical types are trimmed and case-normalized against the existing 19-value tuple. Empty or
unsupported types use the unmodified neutral base class and the default title `Callout`;
supported types use human-readable type titles when no non-empty title is supplied.

**Rationale**: The existing generated-markup classes already have shared styles and six
semantic treatment families in `styles/obsidian.css`, plus preset refinements. Reusing them
makes component-authored and generated callouts structurally and visually comparable.
`role="note"` describes static explanatory content without turning it into a live notification;
see the [WAI-ARIA note role](https://www.w3.org/TR/wai-aria-1.2/#note).

**Alternatives considered**: Treating invalid input as `note` was rejected because neutral
fallback is distinct from the supported `note` meaning. `role="alert"`/`aria-live` was rejected
because authored slide content is not a dynamic alert. A parallel class family was rejected
because it would duplicate the established semantic contract.

## 5. Figure Semantics and Failure Behavior

**Decision**: `Figure` will render native `<figure>`, `<img>`, and conditional `<figcaption>`
elements using `.obsidian-slidev-media` image classes. Accessible text follows tri-state `alt`
precedence: an explicit empty string is decorative, a non-empty value is the description,
omission falls back to a non-empty caption, and omission of both produces the documented generic
`Figure` fallback. A bounded media shell reserves geometry; a load failure removes the broken
visual while retaining the resolved description and caption.

**Rationale**: This is equivalent to the generated image structure in
`fixtures/obsidian-protocol.md`, inherits the existing media tokens, distinguishes omitted from
explicitly decorative text, and prevents a failed/late image from destabilizing adjacent
content. Native [figure semantics](https://html.spec.whatwg.org/multipage/grouping-content.html#the-figure-element)
are preferable to reconstructing image behavior with generic roles.

**Alternatives considered**: CSS-background-only images were rejected because they cannot carry
native alternative text. A separate `decorative` boolean was rejected because it can conflict
with `alt`; explicit `alt=""` already has standard meaning. Allowing the broken image icon to
remain was rejected because current quality checks treat incomplete images as failures.

## 6. Authors and Email Handling

**Decision**: Extend `setup/authors.ts` rather than creating another author model. Add one shared
deck-author resolver used by the cover, frame footer, and `Authors`. `Authors` renders a `<ul>`
only when valid entries exist, preserves declared order and intentional duplicates, omits absent
fields, and links only trimmed syntactically valid email values with `mailto:`.

**Rationale**: The existing normalizer already accepts strings and partial records. A shared
resolver removes repeated plural/singular fallback logic without changing root metadata.
List/card structure gives a collection semantic, while the current link focus treatment covers
keyboard access.

**Alternatives considered**: Sorting or de-duplicating was rejected because declaration order
and intentional duplicates are requirements. Requiring a name was rejected because the current
normalizer permits institution- or email-only records. Rendering an empty collection or blank
labels was rejected.

## 7. Layout Sharing and Built-in Compatibility

**Decision**: Provide `end`, `thanks`, `image-left`, `image-right`, and `code` as public layouts.
`thanks.vue` is an exact module alias of `end.vue`. Closing and image/text behavior is shared
through `internals/ClosingLayout.vue` and `internals/ImageTextLayout.vue`. Both image
orientations use the same narrative-then-figure DOM order and mirror only CSS grid placement.
The image layouts retain Slidev 52's existing `image`, `class`, and `backgroundSize` inputs and
default, while adding `imageAlt` and `caption`. The code layout keeps a visible title and gives
the primary code wrapper the full content width with contained horizontal/vertical overflow.

**Rationale**: Slidev already supplies built-in `end`, `image-left`, and `image-right`; a theme
override must not silently drop their ordinary-Markdown surface. Exact aliasing prevents `end`
and `thanks` from drifting. Stable DOM order preserves reading meaning independent of visual
orientation. See [Slidev built-in layouts](https://sli.dev/builtin/layouts).

**Alternatives considered**: Copied closing templates and orientation-specific content trees
were rejected as behavior forks. Reversing DOM order for `image-right` was rejected for
accessibility. Dropping `class` or `backgroundSize` was rejected as a compatibility regression.

## 8. Steps, Timeline, Labels, and Keyboard Input

**Decision**: `Steps` and `Timeline` accept a default slot containing one Markdown ordered list;
the compiled `<ol>/<li>` source order remains the semantic authority. Timeline labels may use a
native `<time datetime>` when the author has a machine-readable date. `Tag` and `Badge` render
non-focusable inline text with different shape/border/icon cues as well as visible wording.
`Kbd` renders native `<kbd>`; its `keys` array form renders nested keycaps with readable plus
separators for chords.

**Rationale**: Slotted Markdown supports formatted bodies without adding public `Step` or
`TimelineItem` components. Native ordered lists and
[`kbd`](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-kbd-element)
preserve meaning when CSS is unavailable. Visible text and structural cues satisfy the
[WCAG use-of-color rule](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color).

**Alternatives considered**: Generic `div` sequences were rejected because they lose order.
Structured string-only item props were rejected because they make formatted content awkward.
Live-region roles and tabindex were rejected because these aids are static, not interactive.

## 9. Presentation-only Tasks and Highlighting

**Decision**: Add an idempotent rendering normalizer in `setup/task-lists.ts`, invoked from app
setup, that finds Slidev's `.task-list-item-checkbox` inputs and makes them disabled and
non-focusable without changing `checked` state or Markdown conversion. Shared CSS supplies
aligned checked/unchecked shapes and a non-color check cue. Style native `<mark>` and accepted
`.obsidian-slidev-highlight` output as prose highlights, with selectors/tests that exclude
`pre` and `code`.

**Rationale**: Slidev 52 emits enabled task inputs; CSS can block pointer input but cannot remove
them from keyboard order. A narrow render-time normalization keeps parser/converter
responsibilities unchanged while meeting the presentation-only contract. The repository already
styles `<mark>` and explicitly leaves `==...==` parsing out of scope.

**Alternatives considered**: CSS-only checkbox treatment was rejected because enabled inputs
remain focusable. Making tasks editable was rejected as out of scope. A new `==highlight==`
parser was rejected because the theme owns rendering, not Markdown syntax conversion.

## 10. Slide-local Accent Resolution

**Decision**: Change the canonical `accent` definition to scope `deck-and-slide` with
`slideKeys: ['accent']`. Resolve the first valid value from local `frontmatter.accent`, deck
`themeConfig.presentation.accent`, and preset tokens. Keep `setup/main.ts` deck-only; bind the
resolved local variables only on each `SlideFrame` root.

**Rationale**: The frame already binds `--presentation-accent` and `--slidev-theme-primary` as
computed inline styles. Per-instance CSS inheritance prevents leakage to the next slide and
works when multiple slides are mounted. Invalid or empty local input naturally falls through.
Official logo pixels and locked institutional tokens do not depend on the configurable accent.
See [Vue class/style binding](https://vuejs.org/guide/essentials/class-and-style.html).

**Alternatives considered**: Rewriting `document.documentElement` during navigation was
rejected because it leaks across mounted slides and requires fragile cleanup. Raw-value CSS
selectors and preset-specific resolution were rejected because they bypass the shared
normalizer.

## 11. Styling Ownership

**Decision**: Add `styles/components.css` for the new generic component visuals. Keep native
Markdown tasks/highlights in `styles/base.css`, generated and component-authored
callout/figure compatibility in `styles/obsidian.css`, layout geometry in `styles/layouts.css`,
and common variables in `styles/tokens.css`. Preset files may change tokens or narrowly refine
the shared classes, never duplicate component markup or behavior.

**Rationale**: This keeps each stylesheet cohesive and maintains one content contract with
three visual expressions.

**Alternatives considered**: Large scoped-style blocks in every SFC were rejected because
generated markup could not reuse them. Copying component rules into each preset was rejected as
maintenance drift.

## 12. Fixture and Verification Strategy

**Decision**: Add `fixtures/expanded-content.md` as a standalone no-conversion-plugin deck and
build it under all three presets. Keep `fixtures/obsidian-protocol.md` focused on raw generated
markup and extend it with task/highlight compatibility cases. Add exhaustive production-DOM
checks in `tests/quality/content-contracts.spec.mjs`; use representative grouped slides for
committed pixel baselines, Axe, overflow, and human review.

**Rationale**: The standalone fixture proves the public components independently. Exhaustive
DOM/computed-style loops deliver all 19 × 3 × 2 = 114 callout checks without maintaining 114
golden screenshots. Playwright production builds verify Slidev auto-registration and actual
rendering, while Axe alone cannot prove source order, non-color cues, or component/generated
equivalence.

**Alternatives considered**: Adding every case to `preset-isolation.md` was rejected because it
would couple unrelated architecture cases and slide numbering. One fixture per component was
rejected as unnecessary build overhead. Axe-only or screenshot-only coverage was rejected as
incomplete and poorly diagnostic.

## 13. Navigation Stability and Layout Shift

**Decision**: Add browser-side instrumentation to
`tests/quality/navigation-performance.spec.mjs`. After warm-up, collect at least 20 transitions
per affected scenario. Timestamp the captured ArrowRight event with `performance.now()`, wait
for the target marker, `document.fonts.ready`, decoded visible images, and two consecutive
unchanged animation frames with no intervening mutation, resize, or target-attributed
`layout-shift`; compute nearest-rank p95 as index `ceil(0.95 × N) - 1`. Require new affected
slides at or below 100 ms and unchanged control transitions at or below 110% of their fresh
pre-feature p95.

**Rationale**: Browser-side input timing excludes Playwright/CDP round-trip latency. The combined
signals operationalize “visually stable” and test figure/logo geometry rather than assuming two
frames are sufficient. Raw samples, environment, median, p95, maximum, and layout-shift evidence
remain reviewable.

**Alternatives considered**: Timing `page.keyboard.press()` externally, reusing the current
fixed-wait helper, Lighthouse document navigation, and screenshot completion were rejected
because none measures in-page slide input to stable affected content accurately.

## 14. Output and Asset Budgets

**Decision**: Capture fresh output and navigation baselines from the current pre-implementation
commit before source work. Preserve the 5% total budget for `example.md` and the protocol deck
and add stable logical bundle groups for main CSS, main JS, and `SlideFrame`. Separate
visual-only baseline approval from output/navigation baseline capture. Broaden asset checks to
all shipped theme asset roots; any unapproved file over 256,000 bytes fails. Add delayed-image
tests for figure and optional-logo shells.

**Rationale**: `tests/quality/baselines/output-sizes.json` still contains pre-optimization totals
of roughly 3.2–4.3 MB, while the durable spec-001 after record is roughly 1.36–2.45 MB. Reusing
the loose values would allow material unreported growth. The current asset suite enumerates
known brand files rather than all package assets. A fresh, immutable pre-feature record gives
PERF-001 and PERF-002 meaningful comparisons.

**Alternatives considered**: Updating output baselines after implementation was rejected because
it erases the comparison. Hashed-filename-only bundle checks were rejected as unstable. Keeping
only the brand allowlist was rejected because a new public or asset-root file could escape the
250 KiB gate.
