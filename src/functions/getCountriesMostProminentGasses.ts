import GHG_Emissions from "../models/GHG_Emissions";

async function getNewestReportingYear() {
  const newestYear = await GHG_Emissions.findOne().sort("-reportingYear");
  return newestYear?.reportingYear;
}

// 10
export const getCountriesMostProminentGasses = async () => {
  try {
    const newestReportingYear = await getNewestReportingYear();
    const gasses = await GHG_Emissions.aggregate([
      {
        $match: { reportingYear: newestReportingYear },
      },
      {
        $lookup: {
          from: "organisations",
          localField: "organisation_id",
          foreignField: "_id",
          as: "organisation",
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "organisation.country_id",
          foreignField: "_id",
          as: "country",
        },
      },
      {
        $group: {
          _id: "$country._id",
          id: { $first: "$country._id" },
          countryName: { $first: "$country.name" },
          gasses: { $push: "$gassesIncluded" },
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          countryName: 1,
          gasses: {
            $reduce: {
              input: "$gasses",
              initialValue: "",
              in: {
                $concat: [
                  "$$value",
                  { $cond: [{ $eq: ["$$value", ""] }, "", " "] },
                  "$$this",
                ],
              },
            },
          },
        },
      },
      {
        $unwind: "$countryName",
      },
      {
        $unwind: "$id",
      },
      {
        $sort: { countryName: 1 },
      },
    ]);

    return gasses;
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
};
