import { cypher } from "../utils/dbConnection";

// 9
export const getTotalEmissionsForCountries = async () => {
    try {
    const result = await cypher(
        `
        MATCH (c:Country)<-[:LOCATED_IN]-(ci:City)<-[:OPERATES_IN]-(o:Organisation)-[:HAS_EMISSION]->(g:GHG_Emissions)
        WITH max(g.reportingYear) AS newestYear, c
        MATCH (c)<-[:LOCATED_IN]-(ci:City)<-[:OPERATES_IN]-(o:Organisation)-[:HAS_EMISSION]->(g:GHG_Emissions)
        WHERE g.reportingYear = newestYear AND g.totalCityWideEmissionsCO2 <> ""
        RETURN c.name as Country, sum(toFloat(g.totalCityWideEmissionsCO2)) AS totalEmissionsCO2
        ORDER BY Country
        `
    )

    return {
        countries: result.map((r) => ({
            country: r.get("Country"),
            totalEmission: r.get("totalEmissionsCO2")
        }))
    }

    } catch (errror) {
        console.log("Error:", errror);
        throw errror;
    }
}