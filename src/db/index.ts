import type { NodePgDatabase } from "drizzle-orm/node-postgres";

// Demo/Cloudflare path: never import `pg` so the Worker bundle stays Node-free.
// Persistence is enabled only when a separate Node host sets DATABASE_URL and
// swaps this module; the UI and APIs already fall back to the Tehran catalog.
export const hasDatabase = false;
export const db: NodePgDatabase | null = null;
export const pool = null;
