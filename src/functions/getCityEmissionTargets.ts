import { cypher } from "../utils/dbConnection";

// 4
export const getCityEmissionTargets = async (cityName: string) => {
  try {
    const result = await cypher(
      `
      MATCH (c:City {name: $cityName}) <- [:OPERATES_IN] - (o:Organisation) - [:HAS_TARGET] -> (t:Target)
      return c, o, t;
      `,
      {
        cityName,
      }
    );

    return result.map((record) => {
      const city = record.get("c").properties;
      const target = record.get("t").properties;

      return {
        city,
        target: {
          ...target,
          organisation: record.get("o").properties,
        },
      };
    });
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
