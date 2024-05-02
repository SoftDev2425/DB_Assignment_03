import { cypher } from "../utils/dbConnection";

// 1
export const getTotalEmissionsByCity = async (name: string) => {
  try {
    // const city = await Cities.findOne({ name: { $regex: new RegExp(name, "i") } });

    // if (!city) {
    //   throw new Error("City not found");
    // }

    // const organisation = await Organisations.findOne({
    //   city_id: city._id,
    // });

    // if (!organisation) {
    //   throw new Error("Organisation not found");
    // }

    // const emissions = await GHG_Emissions.find({
    //   organisation_id: organisation._id,
    // }).populate({
    //   path: "emissionStatusType_id",
    //   model: EmissionStatusTypes,
    // });

    // if (!emissions) {
    //   throw new Error("Emission not found");
    // }

    // const populations = await Populations.findOne({
    //   city_id: city._id,
    // });

    // return {
    //   totalEmission: {
    //     reportingYears: [...new Set(emissions.map((emission) => emission.reportingYear))],
    //     total: {
    //       total: emissions.reduce((acc, curr) => acc + curr.totalCityWideEmissionsCO2, 0),
    //       totals: emissions.map((emission) => ({
    //         reportingYear: emission.reportingYear,
    //         total: emission.totalCityWideEmissionsCO2,
    //       })),
    //     },
    //     description: emissions.map((emission) => ({
    //       reportingYear: emission.reportingYear,
    //       change: emission.emissionStatusType_id,
    //       description: emission.description,
    //     })),
    //     comment: emissions.map((emission) => ({
    //       reportingYear: emission.reportingYear,
    //       comment: emission.comment || "No comment",
    //     })),
    //   },
    // };

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
