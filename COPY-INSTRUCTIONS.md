# How to copy this bootstrap to the Stackr repo

This folder contains everything that needs to be added to the Stackr repo. After copying, you can delete `stackr-bootstrap/` from the original workspace.

## What's inside

```
stackr-bootstrap/
├── AGENTS.md                          # AI agent entrypoint (goes to repo root)
├── README.md                          # public README (goes to repo root)
├── HUS.md                             # 25 user stories (reference for GitHub issues)
├── COPY-INSTRUCTIONS.md               # this file (do NOT copy to Stackr)
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── NON-GOALS.md
│   └── adr/
│       ├── 0001-why-supabase.md
│       ├── 0002-why-signals-not-ngrx.md
│       ├── 0003-why-manual-entry-not-web3.md
│       ├── 0004-why-tailwind-v4.md
│       ├── 0005-why-coingecko.md
│       ├── 0006-pnl-calculation-strategy.md
│       └── 0007-why-folder-by-feature.md
├── supabase/
│   └── migrations/
│       ├── 0001_profiles.sql
│       ├── 0002_assets.sql
│       ├── 0003_transactions.sql
│       ├── 0004_price_snapshots.sql
│       └── 0005_rls_policies.sql
└── .github/                           # hidden folder — be careful!
    ├── workflows/
    │   └── ci.yml
    ├── ISSUE_TEMPLATE/
    │   ├── feature.yml
    │   └── bug.yml
    └── pull_request_template.md
```

## Recommended copy command

The safest way to copy everything (including hidden `.github/`):

```bash
# From the my-app workspace:
cd ~/Desktop/Workspace/react/my-app/stackr-bootstrap

# Copy everything (including hidden files) to the Stackr repo:
cp -r AGENTS.md README.md docs supabase .github ~/Desktop/Workspace/portfolio/angular/stackr/

# Note: do NOT copy HUS.md or COPY-INSTRUCTIONS.md to the repo.
# HUS.md is just a reference for creating GitHub issues.
```

⚠️ **Critical:** Make sure `.github/` is copied. It's a hidden folder; Finder may not show it by default. Use `cp -r .github/` explicitly if doing it manually.

## After copying

In the Stackr repo:

```bash
cd ~/Desktop/Workspace/portfolio/angular/stackr

# Verify everything copied:
ls -la                          # should see AGENTS.md, README.md, docs/, supabase/, .github/
ls -la .github/                 # should see workflows/, ISSUE_TEMPLATE/, pull_request_template.md
ls docs/                        # PRD.md, ARCHITECTURE.md, ROADMAP.md, NON-GOALS.md, adr/
ls docs/adr/                    # 7 ADR files
ls supabase/migrations/         # 5 SQL files

# Verify the project still builds (sanity check):
pnpm lint && pnpm type-check && pnpm test && pnpm build

# If all good, stage everything:
git add .
git status                      # review what's being added

# Commit and push:
git commit -m "chore: add docs, migrations, agent context, and CI"
git push -u origin main
```

## Apply Supabase migrations to your remote project

```bash
supabase login                                # 1 time only
supabase link --project-ref <YOUR-PROJECT-REF>  # ref is in your Supabase dashboard URL
supabase db push                              # applies all 5 migrations

# Verify in Supabase dashboard:
# Table Editor → should see: profiles, assets, transactions, price_snapshots
# Authentication → Policies → should see all RLS policies active
```

## Create the 25 issues in GitHub Project

Open `HUS.md` from this bootstrap folder. For each HU block:

1. Go to your GitHub repo → Issues → New issue → use "Feature / User Story" template.
2. Copy the block content (title + user story + acceptance criteria) into the issue.
3. Set labels: `feature`, plus `priority/P0|P1|P2` and `size/S|M|L`.
4. Add to milestone: Week 1, Week 2, ... Week 6.
5. Open the GitHub Project "Stackr — Roadmap" board → drag the issue from Backlog to its Sprint column.

## Clean up

Once everything is verified in the Stackr repo and pushed:

```bash
# Back in the my-app workspace, you can safely delete stackr-bootstrap:
cd ~/Desktop/Workspace/react/my-app
rm -rf stackr-bootstrap

# This workspace is back to clean state (only CV remains).
```
