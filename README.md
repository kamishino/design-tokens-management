# Design Token Manager

A Single Source of Truth (SSOT) for managing design tokens across projects.

## 🌟 Features
- **3-Tier Hierarchy:** Global -> Client -> Project.
- **W3C Standard:** Uses `$value` and `$type` format.
- **Strict Validation:** Zod schemas ensure data integrity.
- **Auto Build:** Style Dictionary transforms JSON to CSS Variables.
- **Visual Dashboard:** React UI to preview tokens.

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Build Tokens for a Project:**
   ```bash
   # Syntax: npm run build:tokens -- --project=client/project
   npm run build:tokens -- --project=brand-a/app-1
   ```

3. **Run Dev Server:**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

- `tokens/global/`: Base, Alias, and Generated tokens (always included).
- `tokens/clients/[client]/`: Client-specific theme tokens.
- `tokens/clients/[client]/projects/[project]/`: Project-specific overrides.
- `src/schemas/`: Zod validation logic.
- `src/utils/lineage.ts`: Smart build path resolution.
- `scripts/build-tokens.js`: Build pipeline script.