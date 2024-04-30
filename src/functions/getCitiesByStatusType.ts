import GHG_Emissions from "../models/GHG_Emissions";
import EmissionStatusTypes from "../models/emissionStatusTypes";
import Populations from "../models/populations";

// 2
export const getCitiesByStatusType = async (statusType: string) => {
  try {
    const status = await EmissionStatusTypes.findOne({
      type: { $regex: new RegExp(statusType, "i") },
    });

    if (!status) {
      throw new Error("Status type not found: " + statusType + "\n Must be either: 'increased' or 'decreased'");
    }

    const emissions = await GHG_Emissions.find({ emissionStatusType_id: status._id }).populate({
      path: "organisation_id",
      model: "Organisations",
      populate: {
        path: "city_id",
        model: "Cities",
      },
    });

    if (!emissions) {
      throw new Error("No emissions found for status type: " + statusType);
    }

    const populatedEmissions = await Promise.all(
      emissions.map(async (emission: any) => {
        const populations = await Populations.find({ city_id: emission.organisation_id.city_id._id });

        return {
          city: {
            id: emission.organisation_id.city_id._id,
            name: emission.organisation_id.city_id.name,
            populations: [
              ...populations
                .reduce((map, population) => {
                  if (!map.has(population.year)) {
                    map.set(population.year, { year: population.year, count: population.count });
                  } else {
                    map.get(population.year).count += population.count;
                  }
                  return map;
                }, new Map())
                .values(),
            ],
            C40Status: false,
          },
          emission: {
            change: status.type,
            reportingYear: emission.reportingYear,
            measurementYear: emission.measurementYear,
            boundary: emission.boundary,
            methodology: emission.methodology,
            methodologyDetails: emission.methodologyDetails,
            description: emission.description,
            gassesIncluded: emission.gassesIncluded,
            totalCityWideEmissionsCO2: emission.totalCityWideEmissionsCO2,
            totalScope1_CO2: emission.totalScope1_CO2,
            totalScope2_CO2: emission.totalScope2_CO2,
          },
        };
      })
    );

    return populatedEmissions;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
