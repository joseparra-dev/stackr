# ADR 0006 — P&L calculation strategy

## Status

Accepted (2026-05).

## Context

We need to calculate profit/loss per asset and per portfolio. Multiple accounting methods exist.

## Options considered

1. **FIFO** (First In, First Out) — sells consume oldest buys first.
2. **LIFO** (Last In, First Out) — sells consume newest buys first.
3. **HIFO** (Highest In, First Out) — sells consume most expensive buys first (tax optimization).
4. **Weighted average cost** — single average cost basis per asset.

## Decision

**Weighted average cost basis. No tax-method support in v1.**

## Rationale

- Simplest to implement and explain to users.
- Sufficient for an MVP that doesn't claim to be a tax tool.
- Avoids complexity of matching sells to specific buys (FIFO/LIFO require lot tracking).
- Future: mention in NON-GOALS that proper FIFO/LIFO is v2 work.

## Algorithm

```
For each asset:
  total_bought = sum(buy.quantity for buy in buys)
  total_spent  = sum(buy.quantity * buy.price + buy.fee for buy in buys)
  avg_cost     = total_spent / total_bought

  total_sold   = sum(sell.quantity for sell in sells)
  total_earned = sum(sell.quantity * sell.price - sell.fee for sell in sells)

  current_quantity   = total_bought - total_sold
  current_value_usd  = current_quantity * current_price
  pnl_realized       = total_earned - (total_sold * avg_cost)
  pnl_unrealized     = current_value_usd - (current_quantity * avg_cost)
  pnl_total          = pnl_realized + pnl_unrealized
```

## Trade-offs accepted

- Less accurate than FIFO for tax reporting. Acknowledged in UI: "estimated P&L, not tax-grade".
- Doesn't differentiate short-term vs long-term gains.

## Consequences

- `calculateHoldings(txns, prices)` is pure function in `@shared/utils/math.ts`.
- 100% unit test coverage required (financial math).
- Tests use deterministic fixtures, never random.
