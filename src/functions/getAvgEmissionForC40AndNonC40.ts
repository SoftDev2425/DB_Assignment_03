import GHG_Emissions from "../models/GHG_Emissions";

// 3
export const getAvgEmissionForC40AndNonC40 = async () => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "organisations",
          localField: "organisation_id",
          foreignField: "_id",
          as: "organisation",
        },
      },
      { $unwind: "$organisation" },
      {
        $lookup: {
          from: "cities",
          localField: "organisation.city_id",
          foreignField: "_id",
          as: "city",
        },
      },
      { $unwind: "$city" },
      {
        $group: {
          _id: "$city.C40Status",
          totalCityWideEmissionsCO2: { $avg: "$totalCityWideEmissionsCO2" },
          totalScope1_CO2: { $avg: "$totalScope1_CO2" },
          totalScope2_CO2: { $avg: "$totalScope2_CO2" },
        },
      },
    ];

    const results = await GHG_Emissions.aggregate(pipeline);

    if (!results || results.length === 0) {
      throw new Error("No emissions found");
    }

    const avgC40Emissions = results.find((result) => result._id === true);
    const avgNonC40Emissions = results.find((result) => result._id === false);

    return {
      avgC40Emissions: {
        total: avgC40Emissions.totalCityWideEmissionsCO2 || 0,
        scope1: avgC40Emissions.totalScope1_CO2 || 0,
        scope2: avgC40Emissions.totalScope2_CO2 || 0,
      },
      avgNonC40Emissions: {
        total: avgNonC40Emissions.totalCityWideEmissionsCO2 || 0,
        scope1: avgNonC40Emissions.totalScope1_CO2 || 0,
        scope2: avgNonC40Emissions.totalScope2_CO2 || 0,
      },
    };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
