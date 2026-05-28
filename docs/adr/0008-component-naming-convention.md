# ADR 0008 — Component naming convention (hybrid)

## Status

Accepted (2026-05).

## Context

Angular 21's CLI changed the default scaffolding to drop component suffixes:

- `ng generate component button` now creates `button.ts` with `class Button`, not `button.component.ts` with `class ButtonComponent`.
- The official Angular style guide endorses the change.

The original convention in this repo (inherited from the pre-Angular-17 era) used the suffixes `*.component.ts` / `*.page.ts` for both routes and reusable components. After bootstrapping the project with `ng new`, the actual generated code (e.g. `app.ts` → `class App`) was already inconsistent with the documented rule.

We had to pick one direction and stick to it.

## Options considered

1. **Drop all suffixes** (full Angular 21 default): `login.ts`, `button.ts`, `dashboard.ts`. Shorter, modern, zero friction with the CLI. Loses the visual cue that distinguishes routes from reusable components.
2. **Keep all suffixes**: `login.page.ts`, `button.component.ts`, `dashboard.page.ts`. Self-documenting, scriptable (`find -name "*.page.ts"`). Goes against the official CLI default and adds noise on reusable components.
3. **Hybrid**: keep `*.page.ts` for route-level components only; drop the suffix on every other component. Service/store/guard/types suffixes remain — they encode usage patterns, not file types.

## Decision

**Option 3 — hybrid.**

## Rationale

- `*.page.ts` answers a routing-related question that is asked often: "Is this component a route or a reusable?". Keeping it pays for itself when navigating large codebases or scripting refactors.
- `*.component.ts` was pure redundancy. Every file decorated with `@Component()` is, by definition, a component — repeating it in the name added no information. Angular 21's default agrees.
- `*.service.ts`, `*.store.ts`, `*.guard.ts`, `*.types.ts` are not "file-type" markers — they encode the usage pattern (singleton injectable, signals-based state, functional route guard, type-only export). Those stay.
- This convention is fully compatible with the CLI: `ng generate component features/auth/login --type=page` produces files that match it.

## Trade-offs accepted

- Slight friction when generating: developers must remember `--type=page` for route components (mitigated by configuring schematic defaults in `angular.json`).
- Code reviewers familiar with the all-suffixed Angular style might initially miss the missing `Component` suffix on reusables. A one-line note in `AGENTS.md` and a link to this ADR addresses it.

## Consequences

- Existing files renamed where applicable:
  - `src/app/app.ts` → kept as-is (already matches the new rule).
  - `src/app/features/auth/login/login.ts` → renamed to `login.page.ts`, class `Login` → `LoginPage`.
- `angular.json` schematic defaults updated so `ng generate component <route>` produces page-suffixed files when intended.
- `.cursor/rules/angular.mdc` and `docs/ARCHITECTURE.md` updated to match.
