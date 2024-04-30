import GHG_Emissions from "../models/GHG_Emissions";
import Cities from "../models/cities";
import EmissionStatusTypes from "../models/emissionStatusTypes";
import Organisations from "../models/organisations";
import Populations from "../models/populations";

// 1
export const getTotalEmissionsByCity = async (name: string) => {
  try {
    const city = await Cities.findOne({ name: { $regex: new RegExp(name, "i") } });

    if (!city) {
      throw new Error("City not found");
    }

    const organisation = await Organisations.findOne({
      city_id: city._id,
    });

    if (!organisation) {
      throw new Error("Organisation not found");
    }

    const emissions = await GHG_Emissions.find({
      organisation_id: organisation._id,
    }).populate({
      path: "emissionStatusType_id",
      model: EmissionStatusTypes,
    });

    if (!emissions) {
      throw new Error("Emission not found");
    }

    const populations = await Populations.findOne({
      city_id: city._id,
    });

    return {
      city: {
        id: city._id,
        name: city.name,
        populations,
        C40Status: city.C40Status,
      },
      totalEmission: {
        calculated_on_ids: emissions.map((emission) => emission._id),
        reportingYears: [...new Set(emissions.map((emission) => emission.reportingYear))],
        total: {
          total: emissions.reduce((acc, curr) => acc + curr.totalCityWideEmissionsCO2, 0),
          totals: emissions.map((emission) => ({
            reportingYear: emission.reportingYear,
            total: emission.totalCityWideEmissionsCO2,
          })),
        },
        description: emissions.map((emission) => ({
          reportingYear: emission.reportingYear,
          change: emission.emissionStatusType_id,
          description: emission.description,
        })),
        comment: emissions.map((emission) => ({
          reportingYear: emission.reportingYear,
          comment: emission.comment || "No comment",
        })),
      },
    };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
