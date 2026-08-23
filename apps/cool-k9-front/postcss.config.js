import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    // Pointed at an absolute path rather than left to Tailwind's cwd-based lookup:
    // when the build runs from another directory the config is never found, and Tailwind
    // silently falls back to its defaults, emitting a stylesheet without the app classes.
    tailwindcss: { config: join(configDir, 'tailwind.config.js') },
    autoprefixer: {},
  },
};
