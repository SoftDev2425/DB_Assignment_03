import fs from "fs";
import { parse } from "csv-parse";
import * as path from "path";
import Organisations from "../../models/organisations";
import Countries from "../../models/countries";
import Cities from "../../models/cities";
import Sectors from "../../models/sectors";
import Targets from "../../models/targets";
import { cypher } from "../../utils/dbConnection";

const scraper1 = async () => {
  console.log("Scraper 1 started...");
  return new Promise((resolve, reject) => {
    const csvFilePath = path.resolve(__dirname, "2016_Cities_Emissions_Reduction_Targets_20240207.csv");

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
          name: data[0].trim(),
          accountNo: parseInt(data[1]) || null,
        };

        const country = {
          name: data[2].trim(),
        };

        const city = {
          name: data[3].trim(),
          C40Status: data[4].trim() == "C40" ? true : false,
        };

        const target = {
          reportingYear: isNaN(parseInt(data[5])) ? null : parseInt(data[5]),
          baselineYear: isNaN(parseInt(data[8])) ? null : parseInt(data[8]),
          baselineEmissionsCO2: isNaN(parseInt(data[9])) ? null : parseInt(data[9]),
          reductionTargetPercentage: isNaN(parseInt(data[10])) ? null : parseInt(data[10]),
          targetYear: isNaN(parseInt(data[11])) ? null : parseInt(data[11]),
          comment: data[12].trim(),
          sector: data[6].trim(),
        };

        obj.organisation = organisation;
        obj.country = country;
        obj.city = city;
        obj.target = target;

        records.push(obj);
      })
      .on("end", async () => {
        console.log("Read all records in csv", csvFilePath, "// Rows:", records.length);
        console.log("Inserting records into database...");

        try {
          for (const record of records) {
            // create country, city, organisation, sector, target + their relationships
            await cypher(
              `
            MERGE (country:Country {name: $countryName})
            MERGE (city:City {name: $cityName, C40Status: $cityC40})
            MERGE (city)-[:LOCATED_IN]->(country)
            MERGE (organisation:Organisation {name: $organisationName, accountNo: $accountNo})
            MERGE (organisation)-[:OPERATES_IN]->(city)
            MERGE (sector:Sector {name: $sector})
            MERGE (target:Target {targetYear: $targetYear, reportingYear: $reportingYear, baselineYear: $baselineYear, baselineEmissionsCO2: $baselineEmissionsCO2, reductionTargetPercentage: $reductionTargetPercentage, comment: $comment, sector: $sector})
            MERGE (organisation)-[:HAS_TARGET]->(target)
          `,
              {
                countryName: record.country.name,
                cityName: record.city.name,
                cityC40: record.city.C40Status,
                organisationName: record.organisation.name,
                accountNo: record.organisation.accountNo,
                targetYear: record.target.targetYear || "2016",
                reportingYear: record.target.reportingYear,
                baselineYear: record.target.baselineYear || "",
                baselineEmissionsCO2: record.target.baselineEmissionsCO2 || "",
                reductionTargetPercentage: record.target.reductionTargetPercentage,
                comment: record.target.comment,
                sector: record.target.sector,
                targetName: record.target.reportingYear,
              }
            );
          }

          console.log("Scraper 1 done!");
          resolve("Scraper 1 done!");
        } catch (error) {
          reject(error);
        }
      });
  });
};

export default scraper1;
