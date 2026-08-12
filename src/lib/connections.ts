export type ConnectionItem = {
  id: string;
  group: "database" | "core" | "api" | "external" | "not-wired";
  name: string;
  connected: boolean;
  mode: "live" | "json" | "kv" | "proxy" | "demo" | "off";
  detail: string;
  url?: string;
};

export const CONNECTION_FACTS = {
  database: {
    engine: "PostgreSQL + Drizzle (schema only)",
    tables: ["businesses", "collection_runs"],
    live: false,
    reason:
      "src/db/index.ts sets db = null and hasDatabase = false so the Cloudflare Worker does not bundle pg. No DATABASE_URL, no local Postgres on :5432, no Hyperdrive/D1/Supabase.",
    liveHealth: { mode: "demo", database: false, neshan: false },
    fallback: "/api/businesses returns 24 Saadatabad demo rows. Exhibition 440 and oil 1730 come from JSON/RAG, not Postgres.",
  },
  kv: {
    binding: "AGENT_MEMORY",
    id: "4ea51f7cafaf47efb73a366098015e3d",
    live: true,
    detail: "POST /api/memory persists. GET /api/memory reports kvBound=true.",
  },
} as const;
