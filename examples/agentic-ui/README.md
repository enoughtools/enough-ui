# Optional agentic UI integration examples

This private package uses a directory link to EnoughUI's built React package. json-render, TanStack AI and Zod belong to this example and do not become production dependencies of either renderer package. Its integration fixtures stay outside the public component catalog.

From the repository root:

```sh
pnpm build
pnpm --dir examples/agentic-ui install --frozen-lockfile
pnpm --dir examples/agentic-ui typecheck
pnpm storybook
```

The public **AI / Generated UI** story demonstrates progressive composition using only EnoughUI. This package separately provides `GeneratedSurfaceDemo` and `TanStackDemo` developer fixtures. Their unit tests exercise state preservation, schema rejection, approval and resume without a model or external backend.
