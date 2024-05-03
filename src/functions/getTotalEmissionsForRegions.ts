import { cypher } from "../utils/dbConnection";

// 8
export const getTotalEmissionsForRegions = async () => {
  try {
    const result = await cypher(
      `
      MATCH (co:Country) <- [:LOCATED_IN] - (c:City) <- [:OPERATES_IN] - (o:Organisation) - [:HAS_EMISSION] -> (e:GHG_Emissions)
      RETURN co.regionName, SUM(toFloat(e.totalCityWideEmissionsCO2)) AS totalEmissions;
      `
    );

    return result.map((record) => ({
      region: record.get("co.regionName"),
      totalEmissions: record.get("totalEmissions"),
    }));
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
