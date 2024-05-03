import { cypher } from "../utils/dbConnection";

export const getC40CitiesWithEmissions = async (C40Status: string) => {
  // Convert C40Status from a string to a boolean indicating whether it is "C40"
  const status = C40Status === "true";

  try {
    const query = `
    MATCH (c:City)<-[:OPERATES_IN]-(o:Organisation)-[:HAS_EMISSION]->(e:GHG_Emissions)
      WHERE c.C40Status = $status
      WITH c, o, max(e.reportingYear) AS maxYear
      MATCH (c)<-[:OPERATES_IN]-(o)-[:HAS_EMISSION]->(e)
      WHERE e.reportingYear = maxYear
      RETURN c AS city, o AS organisation, e AS emissions
    `;
    const params = { status };
    const result = await cypher(query, params);

    // Assuming `result` is an array of Record objects directly
    return result.map((record) => ({
      city: {
        id: record.get("city").identity.toString(),
        name: record.get("city").properties.name,
        c40status: record.get("city").properties.C40Status,
      },
      organisation: {
        id: record.get("organisation").identity.toString(),
        name: record.get("organisation").properties.name,
        accountNo: record.get("organisation").properties.accountNo, // Assuming accountNo exists
      },
      emissions: {
        id: record.get("emissions").identity.toString(),
        reportingYear:
          record.get("emissions").properties.reportingYear || "N/A",
        totalCityWideEmissionsCO2:
          record.get("emissions").properties.totalCityWideEmissionsCO2 || "N/A",
        // Additional emissions properties can be added here
      },
    }));
  } catch (error) {
    console.error("Failed to fetch emissions data:", error);
    throw new Error("Error fetching emissions data");
  }
};
