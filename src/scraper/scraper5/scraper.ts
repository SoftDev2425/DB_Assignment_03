import fs from "fs";
import { parse } from "csv-parse";
import * as path from "path";
import { cypher } from "../../utils/dbConnection";

const scraper5 = async () => {
  return new Promise((resolve, reject) => {
    const csvFilePath = path.resolve(
      __dirname,
      "2023_Cities_Climate_Risk_and_Vulnerability_Assessments_20240207.csv"
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

        const objData = {
          city: data[3].trim(),
          country: data[4].trim(),
          population: data[16].trim(),
          populationYear: data[17].trim(),
          yearOfPublicationOrApproval: data[12].trim(),
          CDP_Region: data[5].trim(),
          c40Status: data[6].trim() === "true" ? true : false,
          attachment: parseInt(data[9].trim()),
        };

        obj.name = data[0].trim();
        obj.organisationNo = data[1].trim();
        obj.data = objData;

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
            await cypher(
              `
              MATCH (organisation:Organisation {accountNo: $accountNo})
              MERGE (questionnaire:Questionnaire {name: $name, data: $data})
              MERGE (questionnaire)-[:MADE_BY]->(organisation)
              `,
              {
                accountNo: +record.organisationNo,
                name: record.name,
                data: JSON.stringify(record.data),
              }
            );
          }

          console.log("Scraper 5 done!");
          resolve("Scraper 5 done!");
        } catch (error) {
          console.log(error);
          reject(error);
        }
      });
  });
};

export default scraper5;
