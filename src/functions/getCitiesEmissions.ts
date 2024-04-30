import Cities from "../models/cities";

// 6
export const getCitiesEmissions = async () => {
  try {
    let result = await Cities.aggregate([
      // Join cities with organizations
      {
        $lookup: {
          from: "organisations",
          localField: "_id",
          foreignField: "city_id",
          as: "organisations",
        },
      },

      { $unwind: "$organisations" },
      // Join organizations with their GHG emissions
      {
        $lookup: {
          from: "ghg_emissions",
          localField: "organisations._id",
          foreignField: "organisation_id",
          as: "organisations.emissions",
        },
      },

      {
        $lookup: {
          from: "populations",
          localField: "_id",
          foreignField: "city_id",
          as: "populationData",
        },
      },
      {
        $addFields: {
          latestPopulationData: { $last: "$populationData" },
        },
      },
      // Group by city to assemble the final city documents with nested organizations and their emissions
      {
        $group: {
          _id: "$_id",
          cityName: { $first: "$name" },
          populationData: { $first: "$latestPopulationData" },
          organisations: { $push: "$organisations" },
        },
      },

      {
        $project: {
          _id: 0,
          CityID: "$_id",
          CityName: "$cityName",
          Population: "$populationData.count",
          Organisations: "$organisations",
        },
      },
    ]);

    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
