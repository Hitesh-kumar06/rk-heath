# Contributing to RK Health

Thanks for your interest in improving RK Health! This document explains how to propose changes.

## Development setup

```bash
bun install
bun run dev
```

The app runs at http://localhost:8080.

## Branching

- `main` — production-ready
- `feat/<short-name>` — new feature
- `fix/<short-name>` — bug fix
- `chore/<short-name>` — tooling, docs, refactors

## Commit style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add medication reminder toggle
fix: prevent duplicate AI summary generation
docs: update README setup steps
```

## Before opening a PR

1. `bun run lint`
2. `bun run format`
3. Verify the build: `bun run build`
4. Manually test the affected flows (auth, appointments, medications, report).

## Pull requests

- Describe **what** changed and **why**.
- Reference related issues (`Closes #123`).
- Keep PRs focused — one concern per PR.
- Include screenshots for UI changes.

## Reporting bugs

Open an issue with:

- Steps to reproduce
- Expected vs actual behavior
- Screenshots / console errors
- Browser + OS

## Security

Do **not** file security issues publicly. See [SECURITY.md](./SECURITY.md).
