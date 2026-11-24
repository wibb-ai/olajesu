import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'next-env.d.ts', '.claude/**', '.scratch/**']),
  {
    rules: {
      // Plain <img> keeps the current look exactly; revisit next/image when pages are redesigned.
      '@next/next/no-img-element': 'off',
    },
  },
]);
