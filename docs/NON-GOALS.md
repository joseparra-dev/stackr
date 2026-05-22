# Non-Goals — Stackr

This file is **as important as the goals**. Adding any of these to v1 will derail the project.

If a stakeholder, contributor, or your future self asks "shouldn't we also add X?" — point them here.

## Hard NO for v1

### Wallet / blockchain integration

- ❌ Connect Metamask, WalletConnect, or any web3 provider.
- ❌ Read on-chain balances.
- ❌ Sign transactions.

Reason: Web3 integration = minimum 3 weeks of scope. ADR-0003.

### Trading

- ❌ Place buy/sell orders on exchanges.
- ❌ Connect exchange APIs (Binance, Coinbase) for trading.
- ❌ Margin, futures, options.

Reason: Requires API keys, KYC, compliance. Not feasible for portfolio app.

### DeFi

- ❌ Aave, Compound, lending/borrowing.
- ❌ Staking, liquidity providing.
- ❌ Yield farming positions.

### NFTs

- ❌ NFT portfolio tracking.

### Tax & compliance

- ❌ FIFO/LIFO/HIFO cost-basis methods.
- ❌ Tax-event reports.
- ❌ Regulatory compliance flagging.

We use simple weighted-average cost basis. See ADR-0006.

### Multi-currency

- ❌ Display in EUR, GBP, ARS, CLP, etc.
- ❌ Currency conversion logic.

USD only. Mentioned as future work.

### Notifications

- ❌ Push notifications.
- ❌ Price alerts.
- ❌ Email digests.

### Social

- ❌ Share portfolio publicly.
- ❌ Follow other users.
- ❌ Leaderboards.

### Mobile native

- ❌ React Native or Capacitor build.

Web is fully responsive (320px+). If user wants native, mentioned as future v2 work.

### Multi-portfolio

- ❌ Multiple portfolios per user.

1 portfolio = 1 user. Simpler model. Mentioned as future v2.

### Imports

- ❌ CSV import from exchanges.
- ❌ Auto-sync from Coinbase, Binance, Kraken.

Manual entry only. Adding parsers for N exchange formats = nightmare. ADR-0006.

### Backend complexity

- ❌ Custom backend service (Node.js, Go, etc.).
- ❌ Custom auth implementation.
- ❌ Email service for notifications.

Supabase BaaS handles all of it. ADR-0001.

---

## Soft NO (might revisit in v1.1)

These are out for v1 but might be candidates for a quick v1.1 after launch:

- Theme: more than 2 themes (custom themes).
- Languages: more than en/es (pt-BR is a possible add).
- Asset coverage: extending beyond CoinGecko's top 250 coins.
