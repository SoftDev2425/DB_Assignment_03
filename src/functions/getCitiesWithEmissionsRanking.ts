import { cypher } from "../utils/dbConnection";

// 5
export const getCitiesWithEmissionsRanking = async (order: string) => {
  const sortOrder: 1 | -1 = order.toUpperCase() === "ASC" ? 1 : -1;

  try {
    // let mostRecentYearResult = await GHG_Emissions.aggregate([
    //   { $group: { _id: null, latestYear: { $max: "$reportingYear" } } },
    // ]);

    // if (mostRecentYearResult.length === 0) {
    //   throw new Error("No emissions data found");
    // }

    // let mostRecentYear = mostRecentYearResult[0].latestYear;

    // let result = await Cities.aggregate([
    //   {
    //     $lookup: {
    //       from: "organisations",
    //       localField: "_id",
    //       foreignField: "city_id",
    //       as: "organisation",
    //     },
    //   },
    //   { $unwind: "$organisation" },

    //   {
    //     $lookup: {
    //       from: "ghg_emissions",
    //       let: { orgId: "$organisation._id", recentYear: mostRecentYear },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [{ $eq: ["$organisation_id", "$$orgId"] }, { $eq: ["$reportingYear", "$$recentYear"] }],
    //             },
    //           },
    //         },
    //       ],
    //       as: "ghg_emission",
    //     },
    //   },
    //   { $unwind: "$ghg_emission" },
    //   {
    //     $lookup: {
    //       from: "emissionstatustypes",
    //       localField: "ghg_emission.emissionStatusType_id",
    //       foreignField: "_id",
    //       as: "emissionStatus",
    //     },
    //   },
    //   { $unwind: "$emissionStatus" },

    //   {
    //     $lookup: {
    //       from: "populations",
    //       let: { cityId: "$_id" },
    //       pipeline: [{ $match: { $expr: { $eq: ["$city_id", "$$cityId"] } } }, { $sort: { year: -1 } }, { $limit: 1 }],
    //       as: "population",
    //     },
    //   },
    //   { $unwind: { path: "$population", preserveNullAndEmptyArrays: true } },

    //   {
    //     $project: {
    //       city: {
    //         CityID: "$_id",
    //         CityName: "$name",
    //         Population: "$population.count",
    //         C40Status: "$c40Status",
    //       },
    //       Emission: {
    //         EmmisionID: "$ghg_emission._id",
    //         ReportingYear: "$ghg_emission.reportingYear",
    //         TotalEmissions: "$ghg_emission.totalCityWideEmissionsCO2",
    //         TotalScope1Emission: "$ghg_emission.totalScope1_CO2",
    //         TotalScope2Emission: "$ghg_emission.totalScope2_CO2",
    //         EmissionStatus: "$emissionStatus.type",
    //         Description: "$ghg_emission.description",
    //         Comment: "$ghg_emission.comment",
    //       },
    //     },
    //   },
    //   { $sort: { "Emission.TotalEmissions": sortOrder } },
    //   { $limit: 10 },
    // ]);
    // return {
    //   ranked: order,
    //   result,
    // };

    await cypher(
      `
      MATCH (c:City) <- [:OPERATES_IN] - (o:Organisation) - [:HAS_TARGET] -> (e:GHG_Emissions)
      `,
      {}
    );
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
