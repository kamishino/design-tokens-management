# Anti-Patterns & Mistakes Learned

> Auto-updated when the same error occurs 3+ times. AI reads this to avoid repeating mistakes.

- **[Shell]:** Do NOT use Unix syntax (`&&`, `grep`, `rm -rf`) on win32. Use PowerShell equivalents (`;`, `Select-String`, `Remove-Item`). (Learned 2026-02-02)
- **[Import]:** Do NOT assume Chakra UI v3 exports bare components (e.g., `Card`, `Checkbox`). Use multi-part patterns (`Card.Root`, `Checkbox.Root`). (Learned 2026-02-13)
- **[Import]:** Do NOT use `forwardRef` with React 19 — it returns an object, causing "Element type is invalid: got object" errors. Use pure function components instead. (Learned 2026-02-13)
- **[Import]:** Do NOT import `{ Component }` if `Component` is a Namespace. Use `<Component.Root>` instead of `<Component>`. (Learned 2026-02-13)
- **[Logic]:** When adding required props to a component, ALWAYS update all parent usages immediately to prevent runtime crashes. (Learned 2026-02-13)
- **[Path]:** File explorer IDs and token IDs must use the same path format (absolute with leading `/`). Mismatch causes invisible tokens. (Learned 2026-02-06)
- **[CSS]:** Do NOT rely on CSS `group-hover` or `:hover` for interactive menus. Use React state-based visibility for reliable hover management. (Learned 2026-02-06)
- **[CSS]:** Do NOT use `z-index` hacks to escape parent overflow clipping. Use React Portals instead. (Learned 2026-02-07)
- **[Logic]:** Do NOT create components during render (e.g., defining a component inside another component's return). This causes cascading re-renders and React 19 violations. (Learned 2026-02-07)
- **[Config]:** Do NOT hardcode token file lists. Use `import.meta.glob` for dynamic discovery to maintain file system parity. (Learned 2026-02-05)
- **[Shell]:** Do NOT use `npx tsc --noEmit 2>&1 | Select-Object` in PowerShell — stderr gets converted to `ErrorRecord` objects and is silently dropped by pipe. Use `npx tsc --noEmit; echo "EXIT: $LASTEXITCODE"` instead. (Learned 2026-02-23)
- **[Z-Index]:** Do NOT add custom dropdowns with low `z-index` when existing sticky toolbars use higher values (e.g., StudioToolbar at `z-index: 2000` blocked a `z-index: 100` dropdown). Always check the z-index hierarchy first. (Learned 2026-02-23)
