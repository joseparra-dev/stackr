# ADR 0002 — Signals-based stores, no NgRx

## Status

Accepted (2026-05).

## Context

We need state management for the app: transactions, prices, holdings, auth, theme.

## Options considered

1. **Angular Signals + service-based stores** (native).
2. **NgRx** — full Redux pattern.
3. **NgRx Signals (component stores)** — middle ground.

## Decision

**Native Angular Signals + service-based stores.** No external state library.

## Rationale

- App has 6 features and a single user — NgRx is overkill at this scale.
- Signals provide fine-grained reactivity → optimal performance.
- Zero boilerplate compared to actions/reducers/effects/selectors.
- Aligns with Angular team's direction (Signals are the future).
- Easier to test: stores are just classes with signals; computed values are derived purely.

## Trade-offs accepted

- If the app grew to 50+ features with cross-cutting state, we'd consider migrating. Not a concern at this scope.
- No time-travel debugging out of the box. Acceptable for a single-user app.

## Consequences

- Each feature with state has `*.store.ts` injected at root.
- Stores expose readonly signals + mutator methods.
- Derived state via `computed()`.
- Components consume signals directly in templates (`{{ store.totalValue() }}`).
