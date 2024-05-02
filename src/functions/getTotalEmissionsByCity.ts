import { cypher } from "../utils/dbConnection";

// 1
export const getTotalEmissionsByCity = async (name: string) => {
  try {
    const result = await cypher(
      `
    MATCH (c:City) <- [:OPERATES_IN] - (o:Organisation) - [:HAS_EMISSION] -> (e:GHG_Emissions)
        WHERE c.name CONTAINS $name
        return c, o, e;
    `,
      {
        name,
      }
    );

    const uniqueOrganisations = new Set(result.map((r) => JSON.stringify(r.get("o").properties)));

    const uniqueOrganisationsArray = Array.from(uniqueOrganisations).map((org) => JSON.parse(org));

    return {
      city: result[0].get("c").properties,
      organisation: uniqueOrganisationsArray,
      totalEmission: {
        reportingYears: [...new Set(result.map((r) => r.get("e").properties.reportingYear))],
        total: {
          totals: result.map((r) => ({
            reportingYear: r.get("e").properties.reportingYear,
            total: r.get("e").properties.totalCityWideEmissionsCO2,
          })),
        },
        description: result.map((r) => ({
          reportingYear: r.get("e").properties.reportingYear,
          change: r.get("e").properties.emissionStatusType_id,
          description: r.get("e").properties.description,
        })),
        comment: result.map((r) => ({
          reportingYear: r.get("e").properties.reportingYear,
          comment: r.get("e").properties.comment || "No comment",
        })),
      },
    };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
