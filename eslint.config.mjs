// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**', 'coverage/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-explicit-any': 'warn', // Changed from 'off' to 'warn' to encourage proper typing
      '@typescript-eslint/no-unsafe-member-access': 'error', // Enforce type safety on member access
      '@typescript-eslint/no-unsafe-argument': 'error', // Changed from 'off' to 'error'
      '@typescript-eslint/no-unsafe-assignment': 'warn', // Changed from 'off' to 'warn'
      '@typescript-eslint/no-unsafe-call': 'error', // Changed from 'off' to 'error'
      '@typescript-eslint/no-unsafe-return': 'error', // Add this to prevent unsafe returns
      '@typescript-eslint/no-floating-promises': 'error', // Changed from 'warn' to 'error'
      '@typescript-eslint/await-thenable': 'error', // Ensure only promises are awaited
      '@typescript-eslint/no-misused-promises': 'error', // Prevent common promise mistakes
      '@typescript-eslint/require-await': 'warn', // Warn on async functions with no await

      // Code quality rules
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-unnecessary-condition': 'warn', // Catch conditions that are always true/false
      '@typescript-eslint/prefer-nullish-coalescing': 'warn', // Encourage ?? over ||
      '@typescript-eslint/prefer-optional-chain': 'warn', // Encourage ?. over && chains
      '@typescript-eslint/strict-boolean-expressions': 'off', // Too strict for this codebase

      // General ESLint rules
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Discourage console.log
      'eqeqeq': ['error', 'always'], // Enforce === instead of ==
      'curly': ['error', 'all'], // Require braces for all control statements
      'no-duplicate-imports': 'error', // Prevent duplicate imports
      'prefer-const': 'error', // Use const when variable is not reassigned
    },
  },
);
