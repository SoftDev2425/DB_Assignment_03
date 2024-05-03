import { cypher } from "../utils/dbConnection";

// 2
export const getCitiesByStatusType = async (statusType: string) => {
  try {
    const result = await cypher(
      `
      MATCH (c:City) <- [:OPERATES_IN] - (o:Organisation) - [:HAS_EMISSION] -> (e:GHG_Emissions)
      WHERE e.emissionStatusType CONTAINS $statusType
      RETURN c, o, e;
      `,
      {
        statusType: statusType.charAt(0).toUpperCase() + statusType.slice(1),
      }
    );

    // filter to only have the latest emission by reportingYear
    return result
      .map((record) => {
        const city = record.get("c").properties;
        const emission = record.get("e").properties;

        return {
          city,
          emission,
        };
      })
      .filter((record) => {
        return (
          record.emission.reportingYear ===
          Math.max(
            ...result
              .map((record) => {
                return record.get("e").properties.reportingYear;
              })
              .filter((reportingYear) => {
                return reportingYear !== null;
              })
          )
        );
      });
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
