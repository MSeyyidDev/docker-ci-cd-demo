# Contributing

Thanks for the interest. A few ground rules to keep the project portfolio-grade.

## Conventions

- All code, comments, commit messages, and docs are in **English**.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: ...`, `fix: ...`, `refactor: ...`, `test: ...`, `docs: ...`, `chore: ...`, `ci: ...`.
- Pull request titles match the same format.

## Layering rules

The project deliberately keeps strict layer boundaries:

- **`domain/`** — pure data + invariants. Knows nothing about Express, Zod, or persistence.
- **`repositories/`** — the persistence boundary. Express must never call a repository directly.
- **`services/`** — application use cases. Composes repositories and domain. Throws domain errors, never `Response`s.
- **`controllers/`** — the HTTP boundary. Translates between Express and the service.
- **`routes/`** — wires controllers to URLs. No logic here.
- **`middleware/`** — cross-cutting (validation, logging, error rendering).

If your change is making a controller talk to a repository, that is a code smell.

## Local checks before opening a PR

```bash
npm run lint
npm run format:check
npm test
npm run build
```

The CI matrix runs Node 20 and 22; please make sure your change does not regress either.

## Adding endpoints

1. Define the Zod schema under `src/schemas/`.
2. Add the use case to `TaskService` (or a new service) and unit-test it.
3. Add the controller method and wire it in `routes/`.
4. Cover the happy path and at least one validation error path with Supertest.
