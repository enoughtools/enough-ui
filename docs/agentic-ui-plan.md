# Agentic UI implementation plan

Approved November 1, 2026, from the October 31 audit. The active goal covers all six batches below. Package publication is a separate release operation.

## Contract

- Keep EnoughUI semver independent of shadcn CLI releases. Identify compatibility by the Radix catalog, immutable upstream commit, and explicit renderer scope.
- Preserve upstream public interfaces and defaults; document EnoughUI additions. Keep native Astro presentation, React islands for state, proportional typography, and the existing shared Storybook catalog.
- Freeze upstream evidence before changing the baseline. Advance the declared supported commit only when implementations and checks pass.
- Keep json-render and TanStack AI optional integration dependencies outside the UI core. Reuse existing primitives instead of building another chat runtime.

## Batches and completion criteria

1. **Evidence and design contract.** Inspect packaging and existing tests; archive immutable upstream source, docs, metadata, and dependency evidence. Record existing baseline and observed additions.
2. **Compatibility gates.** Verify archived provenance and catalog completeness offline. Compile positive and negative public type fixtures against source and built package entry points; enforce declared required props. Pin type-defining production dependencies and expose baseline metadata in renderer artifacts. Add a separate online upstream discovery command.
3. **Trace and CodeBlock.** Implement every upstream compound export, status/variant, default, ref and interaction contract. Share base styles and variants; provide native Astro presentation and stateful React parts. Include optional highlighting support without a mandatory highlighter bundle. Add React/Astro stories and meaningful interaction/rendering tests.
4. **Agent compositions.** Add Confirmation with recorded outcomes, PromptComposer with attachments and send/stop, Sources with accessible citations, and Trace-based Tool/Plan/Queue/Subagent/Terminal/TestResults examples. Exercise partial streams, cancellation, retry, replay, controlled state and focus. Keep runtime decisions host-owned.
5. **Generated UI pilot.** Supply a typed EnoughUI catalog and json-render registry for a constrained set of existing components, plus a TanStack AI integration story using current APIs. Demonstrate stable IDs, preserved input state, named actions and invalid/loading/empty states. Place integration dependencies in a separate example package.
6. **Validation and adoption.** Rebuild dist and renderer packages. Run type checks, native Astro checks, component tests, provenance/type gates, Storybook builds and accessibility/interaction checks, and isolated packed consumers. Adopt the new baseline only after completion; update attribution, parity, maintenance and release documentation with evidence and limitations.

## Tracking

The thread plan tracks current batch status. Changes and validation results will be recorded here as batches complete. An unsupported runtime, network outage, or upstream mismatch must be reported rather than silently weakening the checks.

### November 1 implementation

- Batches 1–5 are implemented. The source and both renderer manifests prepare version 0.6.0, with Radix baseline `c0d63c339d6cd2fc26135590a54cf1f362269451`.
- The archive contains 141 verified files. Compatibility checks compile reference, source and public built-package usage with 52 declared-prop/type assertions and targeted negative fixtures. Both archives expose the same compatibility metadata and exact production dependency evidence.
- Trace/CodeBlock include shared styles, native presentation, stories and behavior checks. AgentConfirmation, PromptComposer, Sources, InlineCitation and AgentWork are documented additions; plan/queue/tool/subagent/terminal/test-result recipes reuse AgentWork.
- The separate optional example uses json-render 0.21.3 and TanStack AI 1.0.1. Tests exercise progressive rendering, preserved input identity/focus, named actions, invalid props/references/cycles, real approval/resume and denial. Zod was upgraded to patched 4.6.6 after the example audit identified a vulnerability. Both dependency audits now pass; CI and Dependabot include the example.
- Source/type/native Astro checks, the full repository/component suites, 39 focused browser checks across 32 stories, and isolated React/Astro package and browser consumers pass. A highlighting contrast failure found during browser testing was corrected in shared CSS.
- Batch 6 is complete. All 435 stories passed in four complete browser batches, including 501 rendering/accessibility/typography/interaction/mobile checks. The report merger checked exact inventory coverage with no omissions or duplicates. The initial monolithic run was terminated after 400 clean scans; it was replaced by these fully completed batches, without dropping assertions.
- Preview verification passed for all 84 images (6 checks), catalog navigation passed 15 checks, and the source viewer passed 9 checks. Isolated 0.6.0 React/Astro archives passed imports, strict types, production builds and browser scenarios, including packaged Trace/CodeBlock and approval receipts. Native Astro installed no React renderer.
- A final generated-UI regression rejects repeated component references, keeping identity unambiguous and traversal bounded. Its four source tests and type check passed; the rebuilt example then passed six additional browser checks across its four stories. The full report and supplemental report remain inspectable under `artifacts/storybook/`.
- Both production renderer packages and compatibility metadata are rebuilt at 0.6.0. All six batches are complete. Package publication is outside this implementation goal; no release was published.

## Catalog refinement — 2026-11-01

The public catalog is runtime-neutral. shadcn is the external component-interface reference; optional integration runtimes remain developer fixtures outside the catalog. Generated UI demonstrates progressive EnoughUI composition directly. Removed implementation notes from Code Block examples. Agent Work uses shared status icons, connected steps and clearer nested progress in React and native Astro. Composer keeps attachment, send and stop controls inside a single field and includes empty, attached-file and failed-send examples.

Validation: rebuilt source and renderer packages; React/story types and native Astro diagnostics pass; 52 upstream interface assertions pass against reference, source and built exports. Focused React tests cover failed drafts, IME, stop, attachment removal/focus and streamed disclosure state. Catalog tests prohibit optional-runtime imports and branding in Generated UI examples.

The rebuilt catalog passed 25 browser checks across the 22 affected stories, including mobile Composer behavior, and all 99 native Astro catalog rendering tests. All 84 catalog previews were regenerated from real stories.

## Final component polish — 2026-11-01

Tightened Agent Work rows and nested detail spacing, connected each step to the next icon, and emphasized active titles while retaining readable completed and pending states. Native Astro uses the same status hierarchy and detail styles. Composer now grows and shrinks with controlled drafts, observes width changes, caps long drafts at 240 pixels, and restores message focus after Stop. Attachment cards show a file icon, filename, format and size; the examples demonstrate a composed Plan/Write/Review menu. Confirmation actions stack on mobile; recorded outcomes use compact icons. Source lists share numbered layout and secondary descriptions across renderers. Code Block uses consistent header and content padding.

The browser contrast scan found that InputGroup's disabled-descendant styling dimmed an empty Composer when Send was disabled. Composer now distinguishes a disabled Send action from a disabled field, and uses a readable placeholder color. Added browser scenarios for growth/shrinkage, empty-field readiness, mode selection, attachment removal/focus and mobile confirmation decisions. No upstream component interfaces were changed; no runtime branding was introduced into the catalog.

Final validation: all 190 React unit tests passed; 102 native Astro rendering tests passed; React/story type checks and Astro diagnostics passed; all 52 interface assertions passed against reference, source and rebuilt exports. The final catalog passed 40 browser checks across 31 affected stories with zero accessibility or interaction failures. All 84 real-story catalog previews were regenerated. Source and both renderer packages were rebuilt.
