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

2. **Build Tokens:**
   ```bash
   npm run build:tokens
   ```

3. **Run Dev Server:**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

- `tokens/`: Source JSON files.
- `src/schemas/`: Zod validation logic.
- `scripts/build-tokens.js`: Build pipeline script.