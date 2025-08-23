# Tampermonkey Scripts with TypeScript

This repository contains TypeScript-based Tampermonkey userscripts with proper type checking and build process.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the scripts:
   ```bash
   npm run build
   ```
   This will compile TypeScript files from `src/` to `dist/`.

3. For development with auto-rebuild:
   ```bash
   npm run watch
   ```

## Project Structure

- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript files (auto-generated)
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts

## Adding a New Script

1. Create a new `.ts` file in the `src/` directory
2. Add your Tampermonkey metadata at the top of the file
3. Write your TypeScript code
4. The build process will automatically compile it to JavaScript in the `dist/` directory

## Development

- Use `npm run build` to compile all scripts
- Use `npm run watch` for development with auto-rebuild
- The project includes Prettier for code formatting

## License

MIT
