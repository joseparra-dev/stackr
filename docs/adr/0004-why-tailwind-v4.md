# ADR 0004 — Tailwind v4 + custom components, no UI library

## Status

Accepted (2026-05).

## Context

We need a styling approach: pre-built UI library, or custom?

## Options considered

1. **Angular Material** — official, accessible, but Material Design 2014 look.
2. **PrimeNG** — many components, opinionated theming.
3. **Spartan/UI** — shadcn port for Angular, modern, but RC.
4. **Tailwind v4 + Angular CDK + custom components**.

## Decision

**Tailwind v4 + Angular CDK + custom components.**

## Rationale

- Portfolio piece: must demonstrate component-building skills, not library-consumption.
- Tailwind v4 (CSS-first config via `@theme`) is the modern standard.
- Angular CDK provides accessible primitives (overlays, focus management, a11y) — the hard parts of UI work.
- Only ~12 components needed for MVP (Button, Card, Input, Select, Combobox, Dialog, Toast, Skeleton, Table, EmptyState, Tabs, Badge). Achievable in ~1 week.
- Avoids the "looks like Material/PrimeNG" stigma.
- Light + dark theming via CSS variables is trivial.

## Trade-offs accepted

- 1 week of build-out before features can use UI primitives. Acceptable: this is craftsmanship.
- More code to maintain. But it's our code — full control.

## Consequences

- All UI components in `src/app/shared/ui/`.
- Tailwind utility classes in templates. No inline styles. No SCSS.
- For complex composables (large tables), use headless libraries like `@tanstack/angular-table` selectively.
- For charts, use `ng-apexcharts` (themeable).
