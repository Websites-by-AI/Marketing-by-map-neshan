# Exhibition Connector notebooks

Copied from [SoSa123456/Exhibition-connector-rag2-static/notebooks](https://huggingface.co/spaces/SoSa123456/Exhibition-connector-rag2-static/tree/main/notebooks).

These notebooks belong to the **oil-show RAG** (۱۷۳۰ شرکت نفت/گاز)، not the official IRAN CONFAIR building list. Live backend they talk to:

- https://vercel-app-amber-five.vercel.app
- https://sosa123456-exhibition-connector-rag2-static.static.hf.space

| File | Needs GPU / token | What we tested |
|---|---|---|
| `rag_api_colab_test.ipynb` | no | **Run this.** Health, search, Prisma rank-1, scrape, HF frontend |
| `rag_base_model_colab.ipynb` | no | TF-IDF on `companies.json` — Prisma first, overlap with ۴۴۰ CONFAIR |
| `colab_original_exhibition_connector_rag1.ipynb` | yes (Llama/FAISS) | Colab-only. Oil Excel + Wikipedia demo |
| `colab_original_exhibition_connector_rag2.ipynb` | yes | Same as rag1, Excel URL points at rag2 space |
| `llama_wandb_training_colab.ipynb` | yes (LoRA + W&B) | Training recipe, not for production Worker |

Live replay on this site: `/notebooks` and `GET /api/connectors/notebooks`.
