# Tampermonkey Scripts with TypeScript

This repository contains TypeScript-based Tampermonkey userscripts and browser extension generators with proper type checking and build pipelines.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build all scripts and browser extensions:
   ```bash
   pnpm run generate:all
   ```
   This will compile TypeScript source files into `dist/` and build unpacked browser extensions into `extensions/`.

3. For development with auto-rebuild:
   ```bash
   pnpm run build:watch
   ```

4. Run unit tests:
   ```bash
   pnpm test
   ```

## Available Scripts

- `pnpm run build` - Compiles TypeScript files from `src/` to `dist/`.
- `pnpm run build:watch` - Watches `src/` and automatically recompiles TypeScript files.
- `pnpm run generate:extensions` - Generates unpacked Chrome/Edge extensions in `extensions/` using compiled `dist/` scripts.
- `pnpm run generate:icons` - Generates SVG icon assets for generated extensions.
- `pnpm run generate:all` - Runs build, extension generation, and icon generation in sequence.
- `pnpm test` - Runs Jest unit test suites for source scripts.

## Project Structure

- `src/` - TypeScript source files for userscripts and unit tests.
- `dist/` - Compiled JavaScript outputs (auto-generated).
- `extensions/` - Unpacked Chrome/Edge extension directories generated from `dist/` scripts.
- `scripts/` - Build and generator scripts (`generate-extensions.js`, `generate-icons.js`).
- `tsconfig.json` - TypeScript configuration.
- `package.json` - Project dependencies, metadata, and script definitions.

## Adding a New Script

1. Create a new `.ts` file in the `src/` directory.
2. Add Tampermonkey header metadata at the top of the file if needed.
3. Write your TypeScript logic.
4. Optionally add unit tests in a corresponding `.test.ts` file in `src/`.
5. Run `pnpm run generate:all` to compile to `dist/` and update extension bundles.

## Development

- Use `pnpm run generate:all` to rebuild all distribution artifacts.
- Use `pnpm run build:watch` during active development.
- Code formatting is managed via Prettier.

## License

MIT
