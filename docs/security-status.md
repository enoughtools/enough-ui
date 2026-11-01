# Dependency security status

Reviewed November 1, 2026. This records a dependency audit, not a blanket security certification. See [recurring maintenance](maintenance.md) for detection and remediation schedules.

## Dependency updates

The maintenance refresh updates the React/Radix dependencies within their existing major versions and upgrades the Astro, Storybook, Vite, Vitest, Wrangler and Happy DOM development toolchain. Happy DOM moves to 21.0.4 to fix its host code execution advisory. DayPicker moves to v10 after checking its removed deprecated APIs against our calendar and date-picker wrappers; consumers relying on deprecated v9 props must follow the [upstream migration guide](https://daypicker.dev/upgrading). Calendar day labels include the visible day text alongside the full date and selection context for voice control. The committed lockfile resolves all 19 Dependabot findings open at the start of the review, plus additional transitive findings from `pnpm audit`.

Two scoped overrides are necessary while parent dependencies retain vulnerable constraints:

- `monaco-editor>dompurify`: at least 3.4.17, replacing Monaco 0.57.0's exact 3.4.15 dependency. This addresses the template and shadow-root sanitization advisories in the catalog editor.
- `@joshwooding/vite-plugin-react-docgen-typescript>glob`: at least 14.0.2 (resolved to 14.0.3), bringing minimatch 11.0.3. This addresses glob and minimatch findings in Storybook's documentation tooling. The Storybook build exercises this integration after the major transitive upgrade.

Remove each override when its parent supports the fixed dependency. Keep source-viewer behavior and Storybook build checks in the validation path.

The earlier open `http-cache-semantics` finding is no longer present: Astro now resolves 4.3.0. Updated sanitize-html 2.18.1 also removes the unpatched deepmerge dependency from the installed tree.

`pnpm audit --audit-level low` reports **no known vulnerabilities** across the full locked dependency tree. No advisory exceptions, dismissed findings or severity filters were used to reach that result. New advisories can change the result at any time.

## Other security surfaces

GitHub Dependabot and secret scanning returned no open alerts on November 1. Secret scanning and push protection remain enabled. The first CodeQL analysis of main reported six high-severity findings in repository tooling: five filesystem races in the local catalog servers and one case-sensitive HTML script-tag matcher in the artifact dependency checker.

The follow-up uses one catalog server that reads metadata and content through the same open file handle, confines resolved assets to the catalog directory, and rejects paths and symlinks escaping that directory. Astro script dependency discovery now handles uppercase and mixed-case tags and source attributes. Regression tests exercise served assets, directory indexes, malformed URLs, path/symlink escapes and hidden React imports. CodeQL results must confirm closure after the follow-up merges; no findings are dismissed or suppressed.

The CodeQL action init/analyze steps use the same updated revision. All Node setup steps request the latest matching version instead of relying on a cached minor version: a previous Node 22 CI failure selected 22.23.3 while Astro requires at least 22.23.4.

Daily GitHub audits detect newly published dependency advisories even without a code change. The T3 security task checks every six hours and attempts fixes at every severity; unavailable upstream fixes or failed verification remain explicit blockers rather than being silently dismissed.
