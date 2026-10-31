# Recurring maintenance

The repository owner authorizes tested maintenance changes directly to `main` without another approval. Preserve unrelated work, fetch before starting, and never force-push. Publishing a new package release remains a separate operation.

## Automation

Two persistent T3 Code tasks report into the maintenance conversation:

- Security and Dependabot: every six hours. Inspect all open Dependabot alerts, available code-scanning and secret-scanning alerts, security issues, dependency update PRs, audit results, and failing security checks. Fix actionable findings at every severity, including development and transitive dependencies. Recheck after pushing; report unavailable checks or upstream blockers explicitly.
- Code health and shadcn compatibility: Mondays at 09:00 UTC. Prioritize security, then make focused improvements supported by bugs, tests, accessibility checks, or maintainability evidence. Check the live upstream catalog and implement new components and relevant API changes in verified batches.

T3 runs require the scheduling environment, repository access, and model credentials to remain available. These tasks have no configured end date, but cannot guarantee uninterrupted service or that a new vulnerability always has a fix. Inspect their enabled state, next run, and last run result through T3's scheduled task tools. Update existing tasks rather than creating duplicates.

GitHub independently runs the Security workflow on pushes, PRs, and daily at 05:17 UTC. It audits all dependency types and severities and runs CodeQL with extended security queries. Dependabot checks npm and Actions daily and groups security updates. Detection in GitHub continues independently of T3; remediation requires a working agent environment. Do not weaken these checks or dismiss findings to obtain a green status.

T3 also supports webhook triggers. A signed GitHub webhook can reduce response latency, but requires T3 Connect remote access and a signing secret entered through T3's private secret input. The timer is the configured remediation trigger; no repository webhook is configured by this setup.

## Working rules

Use the source package as the source of truth and rebuild `dist` after dependency or source changes. Run the relevant CI checks, including both renderers when shared code or styling changes. Avoid running Storybook builds concurrently with the Astro rendering suite on a shared host; cap test workers when resources are constrained rather than relaxing assertions or timeouts. Review major upgrades and transitive overrides for compatibility. Remove overrides once the parent dependency includes a patched version.

Fix real problems: duplicated or dead code, weak types, missing behavior tests, accessibility failures, needless dependencies or abstractions, and unclear documentation. Do not create filler commits, superficial rewrites, fake activity, or unnecessary public API churn. Report a no-change run when appropriate. Avoid overlapping maintenance work.

## Upstream compatibility

Compare the [official shadcn changelog](https://ui.shadcn.com/docs/changelog), [Radix catalog](https://ui.shadcn.com/docs/components/radix/accordion), and [source repository](https://github.com/shadcn-ui/ui) with `docs/shadcn-radix-parity.json`. Check new files, changed public exports and props, and documented behaviors, not just release tags or component counts.

As of October 31, 2026, the official changelog announces Trace and Code Block beyond our October 2 baseline. Implement these in the weekly compatibility work; the existing manifest intentionally remains pinned until implementation and verification are complete. AI Elements are documented compositions and require separate evaluation rather than assuming every pattern is a core component.

For each addition, supply public exports, shared styles/variants, native Astro presentational components, React islands for stateful behavior, and appropriate stories in the existing React/Astro Storybook catalog. Reuse stories for rendering, interaction and accessibility checks. Preserve proportional typography, including code displays, and keep `--font-mono` mapped to `--font-sans`. Update source attribution and parity evidence only when verified. Report remaining gaps for the next run.
