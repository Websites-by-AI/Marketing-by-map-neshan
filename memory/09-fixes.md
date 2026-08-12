# 2026-08-12 fixes

- `/connect` now server-renders the module matrix. Initial HTML contains «Postgres قطع».
- HF leadfair-1405 is never treated as connected just because the hub page returns HTML 200.
- collection_runs persist on KV `AGENT_MEMORY` (D1 account is at the 10-database cap; Postgres stays off).
- GET `/api/collections` lists KV runs. GET `/api/health` reports `postgres:false` and `kv`.
- Official 25th list is fetched by the Worker at `/api/connectors/icc?edition=25` then written to `iranconfair-cohort.json`.
- LeadFair Pages `production_branch` was `main` while every deploy was `master` preview — that is why `leadfair.pages.dev` and `leadfair.exhibition2world.ir` 404.
- Extra exhibitor websites are overlays (manual / oil-overlap / verified-fetch), never from the official iccexpo list.
- Tokens pasted in chat are leaked. Rotate GitHub, Cloudflare, HF, Telegram.
