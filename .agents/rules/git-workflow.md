# Git Branching, Commit & PR Workflow Policy

## Core Principle
All codebase modifications must be isolated to dedicated feature or fix branches, committed with clear Conventional Commit messages, pushed to the remote repository, and merged into `main` via pull requests created with the GitHub CLI (`gh`). Direct commits to `main` are strictly prohibited.

## Workflow Rules

### 1. Branch Naming Convention
Branches must be created from `main` with a prefix that reflects the nature of the change:
- `feat/<feature-name>`: New user-facing features or capabilities
- `fix/<issue-name>`: Bug fixes, dependency repairs, styling corrections
- `refactor/<module-name>`: Code restructuring without changing external behavior
- `chore/<task-name>`: Build tooling, configuration, linting, rules, documentation updates
- `test/<test-suite>`: Adding or modifying test suites

### 2. Conventional Commit Standards
Commits must follow the Conventional Commits format:
```
<type>(<scope>): <short description in imperative mood>

[optional body with rationale and context]
```
Examples:
- `fix(api): resolve async sqlalchemy and greenlet driver dependencies`
- `feat(web): integrate command palette and toast notification system`
- `fix(privacy): redesign dpdp notice and privacy center in vanilla css`

### 3. GitHub CLI PR & Merge Pipeline
For every branch:
1. Stage and commit changes cleanly:
   ```bash
   git checkout -b <branch-name>
   git add <relevant-files>
   git commit -m "<type>(<scope>): <description>"
   ```
2. Push branch to remote:
   ```bash
   git push -u origin <branch-name>
   ```
3. Create Pull Request using `gh pr create`:
   ```bash
   gh pr create --title "<PR Title>" --body "<PR Detailed Summary>" --base main --head <branch-name>
   ```
4. Merge Pull Request using `gh pr merge`:
   ```bash
   gh pr merge <branch-name> --merge --auto (or --merge / --squash with --delete-branch)
   ```
5. Update local `main`:
   ```bash
   git checkout main
   git pull origin main
   ```
