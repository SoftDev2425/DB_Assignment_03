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
    //   city: {
    //     id: city._id,
    //     name: city.name,
    //     populations,
    //     C40Status: city.C40Status,
    //   },
    //   totalEmission: {
    //     calculated_on_ids: emissions.map((emission) => emission._id),
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
      emission: result.map((r) => r.get("e").properties),
    };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
