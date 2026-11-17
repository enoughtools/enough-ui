# Recurring maintenance

The repository owner authorizes tested maintenance changes directly to `main` without another approval. Preserve unrelated work, fetch before starting, and never force-push. Publishing a new package release remains a separate operation.

GitHub currently protects `main` with a pull request and required `verify (22)` and `verify (24)` checks. When a direct push is rejected, open a maintenance PR, monitor its checks, and merge after validation without requesting another approval. Keep branch protection enabled.

## Automation

Two persistent T3 Code tasks report into the maintenance conversation:

- Security and Dependabot: every six hours. Inspect all open Dependabot alerts, available code-scanning and secret-scanning alerts, security issues, dependency update PRs, audit results, and failing security checks. Fix actionable findings at every severity, including development and transitive dependencies. Recheck after pushing; report unavailable checks or upstream blockers explicitly.
- Code health and shadcn compatibility: Mondays at 09:00 UTC. Prioritize security, then make focused improvements supported by bugs, tests, accessibility checks, or maintainability evidence. Check the live upstream catalog and implement new components and relevant API changes in verified batches.

T3 runs require the scheduling environment, repository access, and model credentials to remain available. These tasks have no configured end date, but cannot guarantee uninterrupted service or that a new vulnerability always has a fix. Inspect their enabled state, next run, and last run result through T3's scheduled task tools. Update existing tasks rather than creating duplicates.

GitHub independently runs the Security workflow on pushes, PRs, and daily at 05:17 UTC. It audits all dependency types and severities and runs CodeQL with extended security queries. Dependabot checks npm and Actions daily and groups security updates. Detection in GitHub continues independently of T3; remediation requires a working agent environment. Do not weaken these checks or dismiss findings to obtain a green status.

T3 also supports webhook triggers. A signed GitHub webhook can reduce response latency, but requires T3 Connect remote access and a signing secret entered through T3's private secret input. The timer is the configured remediation trigger; no repository webhook is configured by this setup.

## Working rules

Use the source package as the source of truth and rebuild `dist` after dependency or source changes. Run the relevant CI checks, including both renderers when shared code or styling changes. Avoid running Storybook builds concurrently with the Astro rendering suite on a shared host; cap test workers when resources are constrained rather than relaxing assertions or timeouts. Review major upgrades and transitive overrides for compatibility. Remove overrides once the parent dependency includes a patched version.

The development dependency `@emnapi/runtime` supplies the stable peer required by Astro’s `astro2tsx` tooling. Without it, pnpm can select the 2.x prerelease runtime alongside the 1.x core and `astro check` crashes with `this.bridge.setLastError is not a function`. Reevaluate this explicit peer when Astro updates its tooling dependencies.

Astro is temporarily pinned to 7.4.7. Updating to 7.4.11 makes all 134 native story rendering tests fail: its markdown plugin calls `import.meta.resolve` inside Vite’s SSR module runner, which does not support that API. This reproduces with Storybook Astro 1.15.0 and 1.16.0; 1.16.0 passes with Astro 7.4.7. Retry newer Astro/tooling releases and remove the pin after the rendering suite and catalog pass.

Fix real problems: duplicated or dead code, weak types, missing behavior tests, accessibility failures, needless dependencies or abstractions, and unclear documentation. Do not create filler commits, superficial rewrites, fake activity, or unnecessary public API churn. Report a no-change run when appropriate. Avoid overlapping maintenance work.

## Unresolved security findings

As of November 17, 2026, the root audit reports two high-severity paths for [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf): picomatch 4.0.7 through `@astrojs/check > @astrojs/language-server > tinyglobby`, and picomatch 2.3.2 through `astro > unstorage > anymatch`. Both enter through development dependencies. Crafted repeated extglob patterns can cause exponential regex backtracking; this does not establish that every use is exploitable.

The advisory has no patched version and npm's latest picomatch is 4.0.7. Upstream is tracking release guidance in [issue #247](https://github.com/micromatch/picomatch/issues/247), with proposed fixes including #237 and #246 still unmerged. Keep audit failures visible. On each security run, check for a maintained fix for both major versions (or a compatible parent replacement), update the lockfile, and run both renderer tests and consumer/catalog checks. Do not remove this finding until the dependency paths and audit confirm resolution.

## Upstream compatibility

Compare the [official shadcn changelog](https://ui.shadcn.com/docs/changelog), [Radix catalog](https://ui.shadcn.com/docs/components/radix/accordion), and [source repository](https://github.com/shadcn-ui/ui) with `docs/shadcn-radix-parity.json`. Check new files, changed public exports and props, and documented behaviors, not just release tags or component counts.

The November 1, 2026 adoption batch adds Trace and Code Block and advances the Radix baseline to commit c0d63c339d6cd2fc26135590a54cf1f362269451. Run `pnpm check:compatibility` for immutable evidence and targeted public interface fixtures, and `pnpm check:upstream` for live source/documentation/metadata/dependency discovery. Keep EnoughUI semver independent of the shadcn CLI; both renderer artifacts expose compatibility metadata. AI Elements remain documented compositions and require separate evaluation rather than assuming every pattern is a core component.

For each addition, supply public exports, shared styles/variants, native Astro presentational components, React islands for stateful behavior, and appropriate stories in the existing React/Astro Storybook catalog. Reuse stories for rendering, interaction and accessibility checks. Preserve proportional typography, including code displays, and keep `--font-mono` mapped to `--font-sans`. Update source attribution and parity evidence only when verified. Report remaining gaps for the next run.
