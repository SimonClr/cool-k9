<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

<behavioral_rules>
<rule_1>Utilise tout le temps la documentation de shadcn-ui pour les composants UI : https://ui.shadcn.com/</rule_1>
<rule_2>On utilise React 19 avec TypeScript. Utilise les dernières pratiques : hooks, functional components, et les conventions modernes de React : https://react.dev/</rule_2>
<rule_3>Pour le styling, utilise Tailwind CSS v4 avec les utility classes : https://tailwindcss.com/</rule_3>
<rule_4>Les composants shadcn-ui doivent être importés depuis @/components/ui et utilisent l'utilitaire cn() pour merger les classes</rule_4>
</behavioral_rules>
