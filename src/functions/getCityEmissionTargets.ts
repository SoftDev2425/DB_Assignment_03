import Cities from "../models/cities";
import Organisations from "../models/organisations";
import Sectors from "../models/sectors";
import Targets from "../models/targets";

// 4
export const getCityEmissionTargets = async (cityName: string) => {
  try {
    const city = await Cities.findOne({
      name: { $regex: new RegExp(cityName, "i") },
    });

    if (!city) {
      throw new Error("City not found");
    }

    const organisation = await Organisations.findOne({
      city_id: city._id,
    });

    if (!organisation) {
      throw new Error("Organisation not found");
    }

    const targets = await Targets.find({
      organisation_id: organisation._id,
    })
      .populate({
        path: "organisation_id",
        model: "Organisations",
        select: ["_id", "name"],
      })
      .populate({
        path: "sector_id",
        model: Sectors,
      });

    if (!targets) {
      throw new Error("Targets not found");
    }

    return {
      city,
      organisation,
      targets: targets.map((target: any) => {
        return {
          id: target._id,
          sector: target.sector_id.name,
          reportingYear: target.reportingYear,
          baselineYear: target.baselineYear,
          targetYear: target.targetYear,
          reductionTargetPercentage: target.reductionTargetPercentage,
          baselineEmissionsCO2: target.baselineEmissionsCO2,
          comment: target.comment,
        };
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
