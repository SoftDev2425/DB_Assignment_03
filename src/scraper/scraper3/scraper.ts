import fs from "fs";
import { parse } from "csv-parse";
import { format } from "date-fns";
import * as path from "path";
import { cypher } from "../../utils/dbConnection";

const scraper3 = async () => {
  return new Promise((resolve, reject) => {
    const csvFilePath = path.resolve(
      __dirname,
      "2016_Citywide_GHG_Emissions_20240207.csv"
    );

    const records: any[] = [];

    const parser = parse({
      delimiter: ",",
      from_line: 2,
    });

    fs.createReadStream(csvFilePath)
      .pipe(parser)
      .on("data", (data) => {
        const obj: any = {};

        const organisation = {
          name: data[1].trim(),
          accountNo: parseInt(data[0]) || null,
        };

        const country = {
          name: data[2].trim(),
        };

        const city = {
          name: data[3].trim(),
          C40Status: data[4].trim() == "C40" ? true : false,
          population: {
            count: parseInt(data[17]) || null,
            year: parseInt(data[16]) || null,
          },
        };

        const emissionStatusTypes = {
          type: data[14].trim() || "",
        };

        const GHG_emissions = {
          reportingYear: isNaN(parseInt(data[5])) ? null : parseInt(data[5]),
          measurementYear: isNaN(parseInt(format(new Date(data[6]), "yyyy")))
            ? null
            : parseInt(format(new Date(data[6]), "yyyy")),
          boundary: data[7].trim() || "",
          methodology: data[8].trim() || "",
          methodologyDetails: data[9].trim() || "",
          description: data[15].trim() || "",
          gassesIncluded: data[10].trim() || "",
          totalCityWideEmissionsCO2: isNaN(parseInt(data[11]))
            ? null
            : parseInt(data[11]),
          totalScope1CO2: isNaN(parseInt(data[12])) ? null : parseInt(data[12]),
          totalScope2CO2: isNaN(parseInt(data[13])) ? null : parseInt(data[13]),
        };

        obj.organisation = organisation;
        obj.country = country;
        obj.city = city;
        obj.emissionStatusTypes = emissionStatusTypes;
        obj.GHG_emissions = GHG_emissions;

        records.push(obj);
      })
      .on("end", async () => {
        console.log(
          "Read all records in csv",
          csvFilePath,
          "// Rows:",
          records.length
        );
        console.log("Inserting records into database...");

        try {
          for (const record of records) {
            // create country, city, organisation, emission + their relationships
            const populationPropertyName = `population${record.city.population.year}`;
            await cypher(
              `
            MERGE (country:Country {name: $countryName})
            MERGE (city:City {name: $cityName, C40Status: $cityC40})
            ON MATCH SET city.${populationPropertyName} = $population
            ON CREATE SET city.${populationPropertyName} = $population
            MERGE (city)-[:LOCATED_IN]->(country)
            MERGE (organisation:Organisation {name: $organisationName, accountNo: $accountNo})
            MERGE (organisation)-[:OPERATES_IN]->(city)
            MERGE (GHGEmissions:GHG_Emissions {reportingYear: $reportingYear, measurementYear: $measurementYear, boundary: $boundary, methodology: $methodology, methodologyDetails: $methodologyDetails, description: $description, gassesIncluded: $gassesIncluded, totalCityWideEmissionsCO2: $totalCityWideEmissionsCO2, totalScope1CO2: $totalScope1_CO2, totalScope2CO2: $totalScope2_CO2, emissionStatusType: $emissionStatusType})
            MERGE (organisation)-[:HAS_EMISSION]->(GHGEmissions)
              `,
              {
                countryName: record.country.name,
                cityName: record.city.name,
                cityC40: record.city.C40Status,
                population: record.city.population.count,
                organisationName: record.organisation.name,
                accountNo: record.organisation.accountNo,
                reportingYear: record.GHG_emissions.reportingYear,
                measurementYear: record.GHG_emissions.measurementYear,
                boundary: record.GHG_emissions.boundary,
                methodology: record.GHG_emissions.methodology,
                methodologyDetails: record.GHG_emissions.methodologyDetails,
                description: record.GHG_emissions.description,
                gassesIncluded: record.GHG_emissions.gassesIncluded,
                totalCityWideEmissionsCO2:
                  record.GHG_emissions.totalCityWideEmissionsCO2,
                totalScope1_CO2: record.GHG_emissions.totalScope1CO2 || "",
                totalScope2_CO2: record.GHG_emissions.totalScope2CO2 || "",
                emissionStatusType: record.emissionStatusTypes.type,
              }
            );
          }

          console.log("Scraper 3 done!");
          resolve("Scraper 3 done!");
        } catch (error) {
          reject(error);
        }
      });
  });
};

export default scraper3;
