import { cypher } from "../utils/dbConnection";

// 5
export const getCitiesWithEmissionsRanking = async (order: string) => {
  try {
    let result;
    if (order === "ASC") {
      result = await cypher(
        `
        MATCH (c:City) <- [:OPERATES_IN] - (o:Organisation) - [:HAS_EMISSION] -> (e:GHG_Emissions)
        WITH c, o, e
        ORDER BY e.reportingYear ASC
        WITH c, o, e
        ORDER BY e.totalCityWideEmissionsCO2 ASC
        RETURN c, o, e
        `,
        {}
      );
    } else {
      result = await cypher(
        `
        MATCH (c:City) <- [:OPERATES_IN] - (o:Organisation) - [:HAS_EMISSION] -> (e:GHG_Emissions)
        WITH c, o, e
        ORDER BY e.reportingYear DESC
        WITH c, o, e
        ORDER BY e.totalCityWideEmissionsCO2 DESC
        RETURN c, o, e
        `,
        {}
      );
    }

    return result
      .filter((record) => {
        return record.get("e").properties.totalCityWideEmissionsCO2 !== "";
      })
      .map((record, idx) => {
        const city = record.get("c").properties;
        const organisation = record.get("o").properties;
        const emission = record.get("e").properties;

        return {
          city,
          emission: {
            ...emission,
            ranking: idx + 1,
          },
        };
      });
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
