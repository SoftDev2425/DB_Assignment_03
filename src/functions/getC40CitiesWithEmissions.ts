import Cities from "../models/cities";
import GHG_Emissions from "../models/GHG_Emissions";
import Organisations from "../models/organisations";

// 7
export const getC40CitiesWithEmissions = async (C40Status: string) => {
  try {
    const c40Cities = await Cities.find({
      C40Status: C40Status == "C40" ? true : false,
    }).select("_id");

    const cityIds = c40Cities.map((city) => city._id);

    const organizationsInC40Cities = await Organisations.find({
      city_id: { $in: cityIds },
    }).select("_id");

    const organizationIds = organizationsInC40Cities.map((org) => org._id); // Extract organization IDs

    const emissions = await GHG_Emissions.find({
      organisation_id: { $in: organizationIds }, // Filter emissions by these organizations
    })
      .populate({
        path: "organisation_id",
        model: "Organisations",
        populate: {
          path: "city_id",
          model: "Cities",
        },
      })
      .populate({
        path: "emissionStatusType_id",
        model: "EmissionStatusTypes",
      });

    return emissions.map((emission: any) => {
      return {
        city: {
          id: emission.organisation_id.city_id._id,
          name: emission.organisation_id.city_id.name,
        },
        organisation: {
          id: emission.organisation_id._id,
          accountNo: emission.organisation_id.accountNo,
          name: emission.organisation_id.name,
        },
        emissions: {
          id: emission._id,
          reportingYear: emission.reportingYear ? emission.reportingYear : "N/A",
          mesurementYear: emission.mesurementYear ? emission.mesurementYear : "N/A",
          totalCityWideEmissionsCO2: emission.totalCityWideEmissionsCO2 ? emission.totalCityWideEmissionsCO2 : "N/A",
          totalScope1_CO2: emission.totalScope1_CO2 ? emission.totalScope1_CO2 : "N/A",
          totalScope2_CO2: emission.totalScope2_CO2 ? emission.totalScope2_CO2 : "N/A",
          gassesIncluded: emission.gassesIncluded ? emission.gassesIncluded : "N/A",
          boundary: emission.boundary ? emission.boundary : "N/A",
          methodology: emission.methodology ? emission.methodology : "N/A",
          methodologyDetails: emission.methodologyDetails ? emission.methodologyDetails : "N/A",
          description: emission.description ? emission.description : "N/A",
          comment: emission.comment ? emission.comment : "N/A",
          status: emission.emissionStatusType_id.type,
        },
      };
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};
