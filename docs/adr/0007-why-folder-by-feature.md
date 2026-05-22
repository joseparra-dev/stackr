# ADR 0007 — Folder by feature, not by type

## Status

Accepted (2026-05).

## Context

Two main approaches to organizing an Angular app's source code:

1. **By type**: `components/`, `services/`, `models/`, `pipes/` (Angular CLI default for old projects).
2. **By feature**: each feature (auth, dashboard, transactions, etc.) is self-contained with its own components, services, stores, types.

## Decision

**Folder by feature.**

## Rationale

- Senior pattern in 2026 Angular projects. Used by Nx, Spartacus, large Angular codebases.
- To work on a feature, you open ONE folder. Less mental context switching.
- Adding/removing features is trivial: delete the feature folder.
- Encourages encapsulation: each feature has clear boundaries.
- Folder-by-type breaks down beyond ~10 features. Folder-by-feature scales.

## Structure

```
src/app/
├── core/         # cross-cutting singletons
├── shared/       # reusable UI primitives + utils
└── features/     # one folder per feature
    ├── auth/
    ├── dashboard/
    ├── transactions/
    └── ...
```

## Trade-offs accepted

- Less obvious where shared UI lives initially. Mitigated: `shared/ui/` is dedicated.
- Sometimes a component is borderline shared vs feature-specific. Rule: if used in 2+ features, promote to `shared/ui/`.

## Consequences

- All feature code colocates.
- `core/` contains only true singletons (auth, supabase client, error handler, theme).
- `shared/` contains only reusable, generic primitives.
