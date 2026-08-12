# Plan: connect IRAN CONFAIR site to Adv-seo-2, old exhibitions, SEO vendors, Hugging Face

Live site: https://neshan-m.exhibition2world.ir  
This repo: Marketing-by-map-neshan  
Reference system: [Websites-by-AI/Adv-seo-2](https://github.com/Websites-by-AI/Adv-seo-2)

Adv-seo-2 is not just another website. It is the **lead-operations OS** (Clinic Signal + exhibition import + SEO audit + outreach). This Neshan/map site should become the **map + exhibition CRM front** and call those modules instead of re-building them.

---

## 1. Related modules (what already exists)

| Module | Where | What it does | How it should plug into this site |
|---|---|---|---|
| **Exhibition importer** | Adv-seo-2 `EXHIBITION_LEADS.md` + `POST /api/exhibition/import` | Parse CSV/HTML/text exhibitor lists, dedupe, score | Feed IRAN CONFAIR 440 + old lists through the same pipeline |
| **Website find + identity match** | `POST /api/exhibition/enrich` | Find official site, 0–100 name match, reject directories | Enrich the 440 booths that have almost no website/phone |
| **AI exhibition relation check** | `POST /api/exhibition/ai-validate` | Gemini or conservative check: is this company really in the show? | Flag returning vs new vs unrelated names |
| **SEO audit + package** | `/api/audit`, `/api/ai-seo-review` | Live homepage audit, P1–P3 package (Launch / Recovery / Growth) | One-click from a booth card |
| **Contact enrich** | `POST /api/contact-enrich` | Public phone, email, WhatsApp, social from official site only | Fill missing phones after website verification |
| **Outreach (consent-gated)** | `/api/send` WhatsApp, Telegram, Bale, Rubika, Eitaa, SMS, email | Human approval + consent required | After the show, not as bulk spam |
| **Proposal PDF** | `/api/proposal-pdf` | Persian RTL PDF | Attach to high-lead exhibitors |
| **Next.js gateway** | `NEXTJS_CONNECTION.md` + Adv-seo | Browser → Next.js → Python with Bearer token | This Cloudflare Worker should use the same gateway |
| **Leadfar** | [seo-liderfer](https://github.com/Websites-by-AI/seo-liderfer) | Persian SEO lead dashboard, audits, channels | UI pattern for P1–P3 queue |
| **Adv-seo v1** | [Adv-seo](https://github.com/Websites-by-AI/Adv-seo) live https://adv-seo.vercel.app | First TypeScript SEO app | Keep as fallback UI |
| **SEO WordPress automation** | [SEO-wordpress-automation](https://github.com/Websites-by-AI/SEO-wordpress-automation) | WP content/SEO jobs | Later: auto-site for exhibitors who buy “build” |
| **Supabase leads** | `SUPABASE_SETUP.sql` | Persist audits and scores | Shared DB for map + Clinic Signal |

---

## 2. Old exhibition / industry company lists

### 2.1 Door & window archive (Dowintech / namayeshgahha.ir)

File in Adv-seo-2: `data/dowintech_industry_candidates_200.csv`  
**200 companies**, all with public landline, **0 verified websites**, status: *NOT CONFIRMED — historical/related industry candidate only*.

Source: https://www.namayeshgahha.ir/نمایشگاه-در-و-پنجره/list-of-exhibitors-at-the-door-and-window/

Top categories: وابسته در و پنجره (84), UPVC/PVC (21), آلومینیوم (19), درب (17), پروفیل (17), پلیمر (16), شیشه (11).

Sample names (first 15):

1. MRD — 04434372757  
2. Persian door — 02177649475  
3. mecaco — 02146811174  
4. zibogroup — 02144031485  
5. آبایان پروفیل — 06142264220  
6. **آبنوس جام کرج** — 02634706969  
7. آتا پلیمر صنعت ارس — 04142277961  
8. آدوپن پلاستیک پرشین (وین‌تک) — 04132466333  
9. آدوپن پلاستیک پرشین (پلاس‌تک)  
10. آدوپن پلاستیک پرشین (پلاس‌پن)  
11. آذر ماشین — 02166475167  
12. آذرصنعت نورلو پلاست  
13. آذین در — 02155534349  
14. آراز پروفیل — 02155064343  
15. آرتا پروفیل پیشرو صنعت جهان — 04533870007  

### 2.2 Overlap with IRAN CONFAIR 1405 (this site)

Only **2 names** clearly match this year’s official booth list:

| Returning company | Old public phone | This year booth |
|---|---|---|
| آبنوس جام کرج | 02634706969 | سالن ۳۸B / ۳۸۲۳۹ |
| آکپا ایران کیش | 04132466095 | سالن ۴۴A / ۴۴۱۲ |

That is useful: returning exhibitors are warmer leads. The other 198 door/window names are **adjacent industry**, not current CONFAIR booths — do not label them as 1405 exhibitors.

### 2.3 International window/door directories (Adv-seo-2 JSON)

- Turkey — Eurasia Window and Door Fair 2026  
- Germany — FENSTERBAU FRONTALE 2026  
- Sweden — Nordbygg 2026  
- Canada — WinDoor / Fenestration Canada  
- USA — GlassBuild America 2026  

Import mode: saved HTML only, no unattended crawl.

### 2.4 Previous IRAN CONFAIR (1404)

Public list still at https://iccexpo.com/fa/iranconfair/25/visitors/participants  
Next job: scrape 25th list and compute returning vs new vs dropped (gold for “they exhibited last year, still no site”).

---

## 3. SEO company list (from Adv-seo-2 `SEO_VENDOR_RESEARCH.md`)

Internal prequalification for Tehran 2026 — **not a ranking or endorsement**.

| # | Agency | Score | Phone | Site |
|---:|---|---:|---|---|
| 1 | سئوف | 88 | 02166902605 | https://seof.ir |
| 2 | تهران سایت | 84 | 02177711200 | https://tehransite.com |
| 3 | وب‌سیما | 82 | 02178358 | https://websima.com |
| 4 | سئوکار | 80 | 02148000019 | https://seokar.com |
| 5 | دی‌ام‌روم | 79 | 02166948816 | https://dmroom.agency |
| 6 | سئو۲۴ | 76 | 02186086864 | https://www.seo24.ir |
| 7 | سئودو | 75 | 02122905759 | https://seodo.agency |
| 8 | ایران وب لایف | 74 | 02188770451 | https://www.iranweblife.com |
| 9 | HDM | 73 | 02188690818 | https://hdmarketing.org |
| 10 | سئو تهران | 71 | 02191018037 | https://seotehran.ir |

Extra: Adsinoo — https://adsinoo.com/

On **this** site these agencies are **partners / competitors / subcontractors**, not exhibitors. Use them for package delivery after a booth buys “SEO local + website”.

---

## 4. Hugging Face projects that matter

Owner: `SoSa123456`  
Docs: Adv-seo-2 `HUGGINGFACE_UPLOAD.md`

### Priority A — plug into this exhibition site

| Space | URL | Role |
|---|---|---|
| **clinic-lead-agent** | https://huggingface.co/spaces/SoSa123456/clinic-lead-agent · https://sosa123456-clinic-lead-agent.hf.space | Full lead OS (audit, exhibition import, send). Currently a **static** Space — must be **Docker** to run Python APIs. |
| **Seocontent** | https://huggingface.co/spaces/SoSa123456/Seocontent | Gemini SEO article studio (sleeping). Use for exhibitor landing-page copy. |
| **Exhibition-connector-rag1-fixed** | https://huggingface.co/spaces/SoSa123456/Exhibition-connector-rag1-fixed | Exhibition RAG (sleeping Docker). Match booth ↔ old lists ↔ products. |
| **Exhibition-connector-rag1-static** | https://huggingface.co/spaces/SoSa123456/Exhibition-connector-rag1-static | Static RAG UI fallback. |
| **Exhibition-connector-rag2-static** | https://huggingface.co/spaces/SoSa123456/Exhibition-connector-rag2-static | Second RAG iteration. |

### Priority B — content / media for booth packages

| Space | Role |
|---|---|
| radio-script-maker / Radio3 / Radio4 | Persian radio/ad scripts for local brands |
| Text2Video-Zero, zeroscope-XL | Short product videos (needs rights + human review; Adv-seo already has `/api/video/*`) |
| Imagecreator, Designing-Emotional* | Creative stills for proposals |
| Persian ASR (wav2vec2, whisper-fa) | Transcribe booth conversations / voice notes after the show |
| FWP, multi-hazard-warning-system | Unrelated; ignore for this product |

**Critical HF fix:** `clinic-lead-agent` is Static and shows the default HF welcome page. Rebuild it as **Docker** from Adv-seo-2, then point this Worker at `CLINIC_SIGNAL_API_URL`.

---

## 4.5 Agent memory (no Obsidian install)

Do **not** install Obsidian for this product. Obsidian is a local desktop viewer and has no API the agent can call.

Free low-memory option already in this repo:

- `GET https://neshan-m.exhibition2world.ir/api/memory` — give this URL to the next agent
- `/memory` human page
- `memory/*.md` optional Obsidian-compatible vault
- `POST /api/memory` appends a note (durable only if Cloudflare KV `AGENT_MEMORY` is bound)

## 5. What this site is missing today

Current neshan-m site has:

- 440 official 1405 booths (name, hall, booth, category, lead score)
- Map pins at the fairgrounds
- CSV/JSON export
- Almost **no phones, emails, websites**
- No audit, no returning-exhibitor flag, no SEO partner match, no HF/RAG, no outreach

---

## 6. Improvement plan (do in this order)

### Phase 0 — this week (before 18 Aug 2026)

1. Keep the official 440 as source of truth (`source=IRAN CONFAIR 1405`).
2. Scrape **1404** list and mark Returning / New / Dropped.
3. Merge phones from Dowintech 200 where names match (already: آبنوس جام کرج, آکپا).
4. Add a **Related modules** panel on the dashboard (SEO vendors + HF + old lists) — done in this update.
5. Wake/rebuild HF Docker: `clinic-lead-agent` + `Exhibition-connector-rag*`.

### Phase 1 — booth enrichment (show week)

1. For each of 440: Places/Brave search → candidate website → identity score (Adv-seo enrich, max 8/request).
2. Contact-enrich only **verified** official sites.
3. Run website analysis already on this Worker for found domains.
4. Opportunity rules from Adv-seo:
   - no site → Launch + SEO (~94)
   - site broken → Technical Recovery
   - SEO &lt; 50 → Recovery
   - 50–79 → Growth 90 days
   - 80+ → Content & CRO

### Phase 2 — product loop

1. Next.js/Worker gateway to Python (`NEXTJS_CONNECTION.md`).
2. RAG: “which 1405 booths overlap old door/window list / international fairs?”
3. Seocontent: generate 1 local landing outline per high-lead booth.
4. Proposal PDF + human-approved WhatsApp/Bale only after consent.

### Phase 3 — after the show

1. Persist leads in Supabase (shared with Clinic Signal).
2. Optional WP automation for buyers.
3. Re-scrape iccexpo if they publish remaining of the ~1000 registrants.

---

## 7. Guardrails (do not skip)

- Do not treat historical Dowintech rows as 1405 exhibitors.
- A page that loads is not automatically the official site.
- No scraping Google/Bing result pages; use APIs or saved HTML.
- No outreach without consent + human approval.
- Never put HF/GitHub/Cloudflare tokens in the repo.

---

## 8. Success metrics for this site

- % of 440 with verified website  
- % with public phone  
- # returning from 1404  
- # P1 “no website” packages ready before opening day  
- HF `clinic-lead-agent` `/api/health` = live Docker, not static hello page  
