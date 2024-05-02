import { cypher } from "../utils/dbConnection";

// 10
export const getCountriesMostProminentGasses = async () => {
  try {
    const result = await cypher(
      `
      MATCH (c:Country)<-[:LOCATED_IN]-(ci:City)<-[:OPERATES_IN]-(o:Organisation)-[:HAS_EMISSION]->(g:GHG_Emissions)
      WITH max(g.reportingYear) AS newestYear, c
      MATCH (c)<-[:LOCATED_IN]-(ci:City)<-[:OPERATES_IN]-(o:Organisation)-[:HAS_EMISSION]->(g:GHG_Emissions)
      WHERE g.reportingYear = newestYear AND g.gassesIncluded <> ""
      WITH c, COLLECT(DISTINCT g.gassesIncluded) AS allGasses
      RETURN c.name AS Country, REDUCE(s = "", gas IN allGasses | s + gas + "; ") AS CombinedGasses
      ORDER BY Country
      `
    )
    return result.map((r) => {
      return {
        countryName: r.get("Country"),
        gasses: Array.from(
          new Set(
            r.get("CombinedGasses")
              .trim()
              .split(/[;\s]+/)
              .map((g: string) => g.trim())
          )
        ).join("; "),
      };
    });
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
};
