# ADR 0001 — Why Supabase

## Status

Accepted (2026-05).

## Context

We need persistent storage, authentication, and security policies for a fintech-style app — without building a custom backend.

## Options considered

1. **Supabase** — PostgreSQL + auth + RLS + realtime, hosted.
2. **Firebase** — Firestore (NoSQL) + auth + realtime, hosted.
3. **Custom Node.js + Postgres** — full control, maximum effort.

## Decision

**Supabase.**

## Rationale

- **PostgreSQL** with CHECK constraints, foreign keys, and types — far better for financial data than Firestore NoSQL.
- **Row-Level Security (RLS)** is the killer feature. Policies live in SQL, are versioned in migrations, and provide defense-in-depth: even with frontend bugs, users can't access others' data.
- **Auth included** with Google OAuth, magic links, etc.
- **Realtime subscriptions** for free.
- **Free tier sufficient** for portfolio + a few hundred users.
- **Most-used stack in modern LATAM fintechs** (Lemon, Belo, others). Strong signal for the target audience.

## Trade-offs accepted

- Vendor lock-in to Supabase. Mitigated: their stack is open source, can self-host PostgreSQL if needed.
- Backend logic limited to PostgreSQL functions + Supabase Edge Functions.

## Consequences

- All data access goes through Supabase SDK.
- All schema changes via SQL migrations in `supabase/migrations/`.
- Security model relies on RLS being correct — needs tests.
