import { cypher } from "../utils/dbConnection";

// async function getNewestReportingYear() {
//   const newestYear = await GHG_Emissions.findOne().sort("-reportingYear");
//   return newestYear?.reportingYear;
// }

// 10
export const getCountriesMostProminentGasses = async () => {
  try {
    // const newestReportingYear = await getNewestReportingYear();
    // const gasses = await GHG_Emissions.aggregate([
    //   {
    //     $match: { reportingYear: newestReportingYear },
    //   },
    //   {
    //     $lookup: {
    //       from: "organisations",
    //       localField: "organisation_id",
    //       foreignField: "_id",
    //       as: "organisation",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "countries",
    //       localField: "organisation.country_id",
    //       foreignField: "_id",
    //       as: "country",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$country._id",
    //       id: { $first: "$country._id" },
    //       countryName: { $first: "$country.name" },
    //       gasses: { $push: "$gassesIncluded" },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       id: 1,
    //       countryName: 1,
    //       gasses: {
    //         $reduce: {
    //           input: "$gasses",
    //           initialValue: "",
    //           in: { $concat: ["$$value", { $cond: [{ $eq: ["$$value", ""] }, "", " "] }, "$$this"] },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $unwind: "$countryName",
    //   },
    //   {
    //     $unwind: "$id",
    //   },
    //   {
    //     $sort: { countryName: 1 },
    //   },
    // ]);

    // return gasses;

    const result = await cypher(
      `
      MATCH (c:Country)<-[:LOCATED_IN]-(ci:City)<-[:OPERATES_IN]-(o:Organisation)-[:HAS_EMISSION]->(g:GHG_Emissions)
      WITH max(g.reportingYear) AS newestYear, c
      MATCH (c)<-[:LOCATED_IN]-(ci:City)<-[:OPERATES_IN]-(o:Organisation)-[:HAS_EMISSION]->(g:GHG_Emissions)
      WHERE g.reportingYear = newestYear AND g.gassesIncluded <> ""
      WITH c, COLLECT(DISTINCT g.gassesIncluded) AS allGasses
      RETURN c.name AS Country, REDUCE(s = "", gas IN allGasses | s + gas + "; ") AS CombinedGasses
      ORDER BY Country
      `
    )
    return result.map((r) => {
      return {
        countryName: r.get("Country"),
        gasses: Array.from(
          new Set(
            r.get("CombinedGasses")
              .trim()
              .split(/[;\s]+/)
              .map((g: string) => g.trim())
          )
        ).join("; "),
      };
    });
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
};
