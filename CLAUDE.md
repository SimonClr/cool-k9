<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

<behavioral_rules>
<rule_1>Utilise tout le temps la documentation de shadcn-ui pour les composants UI : https://ui.shadcn.com/</rule_1>
<rule_2>On utilise React 19 avec TypeScript. Utilise les dernières pratiques : hooks, functional components, et les conventions modernes de React : https://react.dev/</rule_2>
<rule_3>Pour le styling, utilise Tailwind CSS v4 avec les utility classes : https://tailwindcss.com/</rule_3>
<rule_4>Les composants shadcn-ui doivent être importés depuis @/components/ui et utilisent l'utilitaire cn() pour merger les classes</rule_4>
</behavioral_rules>
