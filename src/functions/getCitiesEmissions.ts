import { cypher } from "../utils/dbConnection";

// 6
export const getCitiesEmissions = async () => {
  try {
    const result = await cypher(
      `
      MATCH (c:City) <- [:OPERATES_IN] - (o:Organisation) - [:HAS_EMISSION] -> (e:GHG_Emissions)
      RETURN c, o, e
      `,
      {}
    );

    const cityEmissionsMap = new Map();

    result.map((record) => {
      const city = record.get("c").properties;
      const organisation = record.get("o").properties;
      const emission = record.get("e").properties;

      const cityKey = city.name;

      if (!cityEmissionsMap.has(cityKey)) {
        cityEmissionsMap.set(cityKey, {
          city,
          emissions: [],
        });
      }

      cityEmissionsMap.get(cityKey).emissions.push({
        ...emission,
        organisation,
      });
    });

    const mergedResult = Array.from(cityEmissionsMap.values());
    return mergedResult;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
