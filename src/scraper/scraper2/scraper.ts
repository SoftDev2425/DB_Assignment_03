import fs from "fs";
import { parse } from "csv-parse";
import * as path from "path";
import { cypher } from "../../utils/dbConnection";

const scraper2 = async () => {
  return new Promise((resolve, reject) => {
    const csvFilePath = path.resolve(
      __dirname,
      "2017_Cities_Emissions_Reduction_Targets_20240207.csv"
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
          name: data[3].trim(),
          regionName: data[4].trim(),
        };

        const city = {
          name: data[2].trim(),
          C40Status: data[6].trim() == "C40" ? true : false,
          population: {
            count: parseInt(data[17]) || null,
            year: parseInt(data[18]) || null,
          },
        };

        const targetType = {
          type: data[8].trim(),
        };

        const target = {
          reportingYear: isNaN(parseInt(data[7])) ? null : parseInt(data[7]),
          baselineYear: isNaN(parseInt(data[9])) ? null : parseInt(data[9]),
          baselineEmissionsCO2: isNaN(parseInt(data[10]))
            ? null
            : parseInt(data[10]),
          reductionTargetPercentage: isNaN(parseInt(data[12]))
            ? null
            : parseInt(data[12]),
          targetYear: isNaN(parseInt(data[13])) ? null : parseInt(data[13]),
          comment: data[16].trim(),
          sector: data[9].trim(),
        };

        obj.organisation = organisation;
        obj.country = country;
        obj.city = city;
        obj.targetType = targetType;
        obj.target = target;

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
            // create country, city, organisation, sector, target + their relationships
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
              MERGE (target:Target {targetYear: $targetYear, reportingYear: $reportingYear, baselineYear: $baselineYear, baselineEmissionsCO2: $baselineEmissionsCO2, reductionTargetPercentage: $reductionTargetPercentage, comment: $comment, sector: $sector, targetType: $targetType})
              MERGE (organisation)-[:HAS_TARGET]->(target)
              `,
              {
                countryName: record.country.name,
                cityName: record.city.name,
                cityC40: record.city.C40Status,
                population: record.city.population.count || "",
                organisationName: record.organisation.name,
                accountNo: record.organisation.accountNo,
                sector: record.target.sector,
                targetYear: record.target.targetYear || "2016",
                reportingYear: record.target.reportingYear,
                baselineYear: record.target.baselineYear || "",
                baselineEmissionsCO2: record.target.baselineEmissionsCO2 || "",
                reductionTargetPercentage:
                  record.target.reductionTargetPercentage || "",
                comment: record.target.comment,
                targetName: record.target.reportingYear,
                targetType: record.targetType.type,
              }
            );
          }

          console.log("Scraper 2 done!");
          resolve("Scraper 2 done!");
        } catch (error) {
          reject(error);
        }
      });
  });
};

export default scraper2;
