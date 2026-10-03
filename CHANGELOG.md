# Changelog

## 0.4.0

- Add CountryHeatmap for React and native Astro, sharing country geometry, color scales, labels, missing-data handling, and an expandable exact-value table. Include documented Natural Earth data provenance.
- Apply the existing Enough brand pack to the public repository and Storybook catalog, with approved `e.` artwork, component images, local catalog fonts, and social preview assets.
- Add [ui.enoughtools.com](https://ui.enoughtools.com) as a catalog address while retaining [enoughui.reb.run](https://enoughui.reb.run).
- Keep package README images and documentation links usable on npm through release-specific repository URLs. Update the catalog setup guide for public npm installation.

## 0.3.0

First public release under the EnoughTools organization, licensed under MIT.

- Publish separate `@enoughtools/ui-react` and `@enoughtools/ui-astro` packages at the same version. The former development package name is private; consumers must choose the public renderer packages.
- Cover all 65 families in the pinned shadcn/ui Radix catalog, plus legacy Form, with public export checks. Add the missing calendar, date picker, chart, form, OTP, Sonner, menubar, avatar, attachment, conversation, and native presentation components.
- Share styles and variants between native Astro presentation and React. Stateful controls use React islands in Astro; the native Astro package has no React dependency.
- Preserve EnoughUI's proportional typography and visual identity. Remove decorative arrows and emoji-prone direction glyphs. Keep functional navigation indicators as SVG.
- Improve keyboard interaction, focus restoration, disabled and invalid states, touch targets, narrow layouts, error contrast, and reduced-motion behavior.
- Reuse the shared Astro/React Storybook stories for rendering, accessibility, and interaction checks. Verify the exact release archives in isolated consumer applications.
- Add contribution, conduct, security, attribution, and release policies, together with CI and a GitHub Actions trusted-publishing workflow.

Requirements: Node.js 22.14 or newer; React components use React 19. See the [parity contract](docs/parity.md) for renderer differences and the scope of verified behavior.
