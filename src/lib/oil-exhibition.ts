import oilMeta from "@/data/oil-exhibition.json";
import overlap from "@/data/oil-rag-overlap.json";

export const oilExhibitionMeta = oilMeta;

export const oilConfairOverlap = overlap;

export const oilStats = {
  companies: oilMeta.companies,
  halls: oilMeta.halls,
  websites: oilMeta.websites,
  overlapExact: overlap.length,
  overlapWithSite: overlap.filter((row) => row.website).length,
};
