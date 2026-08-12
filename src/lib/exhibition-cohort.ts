import cohort from "@/data/iranconfair-cohort.json";

export const exhibitionCohort = cohort;

export function cohortStats() {
  return {
    count25: cohort.count25,
    count26: cohort.count26,
    returning: cohort.returning.length,
    newIn26: cohort.newIn26.length,
    droppedAfter25: cohort.droppedAfter25.length,
    ready: cohort.count25 > 0,
    source25: cohort.source25,
    dates25: cohort.dates25,
    matchNote: cohort.matchNote,
  };
}
