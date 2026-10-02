# AGENTS.md — JobPilot Repository Rules & Instructions

## 1. Git Branch, Commit & PR Workflow (Mandatory)
- **Separate Feature/Fix Branches**: Never commit directly to `main`. Every logical unit of work must reside on its own branch (`feat/...`, `fix/...`, `chore/...`, `refactor/...`, `test/...`).
- **Conventional Commits**: Every commit message must follow `<type>(<scope>): <summary>`.
- **GitHub CLI Integration**: Always use `gh pr create` and `gh pr merge` to create pull requests and merge them into `main`.
- **Clean Git History**: Keep commits atomic and self-contained to maintain an informative, bisectable git log.

## 2. Web Application Frontend Rules
- **Pure Vanilla CSS Design System**: Use CSS tokens defined in `apps/web/app/globals.css` (`var(--bg-main)`, `var(--bg-card)`, `var(--bg-elevated)`, `var(--border-subtle)`, `var(--accent-primary)`, etc.).
- **No Tailwind CSS**: Do not use Tailwind utility classes (`bg-slate-*`, `rounded-*`, etc.) as Tailwind is not configured.
- **Rich Aesthetics**: Dark obsidian palette, subtle micro-animations, glassmorphism headers, high-contrast typography, and accessible interactive states.

## 3. Backend Python API Rules
- **FastAPI & Async SQLAlchemy**: All database operations must support async execution with greenlet.
- **Testing Verification**: Always verify changes by running `pytest apps/api` (43+ passing tests).
