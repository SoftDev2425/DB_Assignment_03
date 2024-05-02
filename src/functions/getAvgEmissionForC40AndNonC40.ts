import { cypher } from "../utils/dbConnection";

// 3
export const getAvgEmissionForC40AndNonC40 = async () => {
  try {
    const result = await cypher(
      `
      MATCH (c:City) <- [:OPERATES_IN] - (o:Organisation) - [:HAS_EMISSION] -> (e:GHG_Emissions)
      WITH e.reportingYear AS reportingYear, {
          totalCityWideEmissionsCO2: e.totalCityWideEmissionsCO2,
          totalScope1CO2: e.totalScope1CO2,
          totalScope2CO2: e.totalScope2CO2
      } AS emissions
      RETURN reportingYear, COLLECT(emissions) AS emissionsByYear;
      `,
      {}
    );

    return result.map((record) => {
      const year = record.get("reportingYear");

      const emissions = record.get("emissionsByYear");

      const totalCityWideEmissionsCO2 = emissions.reduce(
        (acc: number, curr: any) => acc + +curr.totalCityWideEmissionsCO2,
        0
      );
      const totalScope1CO2 = emissions.reduce((acc: number, curr: any) => acc + +curr.totalScope1CO2, 0);

      const totalScope2CO2 = emissions.reduce((acc: number, curr: any) => acc + +curr.totalScope2CO2, 0);

      return {
        year,
        totalCityWideEmissionsCO2,
        totalScope1CO2,
        totalScope2CO2,
      };
    });
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
