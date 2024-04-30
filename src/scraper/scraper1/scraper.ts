import fs from "fs";
import { parse } from "csv-parse";
import * as path from "path";
import Organisations from "../../models/organisations";
import Countries from "../../models/countries";
import Cities from "../../models/cities";
import Sectors from "../../models/sectors";
import Targets from "../../models/targets";

const scraper1 = async () => {
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
            // create country
            const newCountry = await Countries.updateOne(
              { name: record.country.name },
              { $setOnInsert: { name: record.country.name } },
              { upsert: true }
            );

            // Capture the country id
            const countryId = newCountry.upsertedId
              ? newCountry.upsertedId._id
              : (await Countries.findOne({ name: record.country.name }))?._id;

            // create city
            const newCity = await Cities.updateOne(
              { name: record.city.name },
              {
                $setOnInsert: {
                  name: record.city.name,
                  C40Status: record.city.C40Status,
                  country_id: countryId,
                },
              },
              { upsert: true }
            );

            // Capture the city id
            const cityId = newCity.upsertedId
              ? newCity.upsertedId._id
              : (await Cities.findOne({ name: record.city.name }))?._id;

            // create organisation
            const newOrganisation = await Organisations.updateOne(
              { accountNo: record.organisation.accountNo },
              {
                $setOnInsert: {
                  name: record.organisation.name,
                  accountNo: record.organisation.accountNo,
                  city_id: cityId,
                  country_id: countryId,
                },
              },
              {
                upsert: true,
              }
            );

            // capture the organisation id
            const organisationId = newOrganisation.upsertedId
              ? newOrganisation.upsertedId._id
              : (await Organisations.findOne({ accountNo: record.organisation.accountNo }))?._id;

            // create sector
            const newSector = await Sectors.updateOne(
              { name: record.target.sector },
              { $setOnInsert: { name: record.target.sector } },
              { upsert: true }
            );

            // Capture the sector id
            const sectorId = newSector.upsertedId
              ? newSector.upsertedId._id
              : (await Sectors.findOne({ name: record.target.sector }))?._id;

            // create target
            await Targets.create({
              reportingYear: record.target.reportingYear,
              baselineYear: record.target.baselineYear,
              targetYear: record.target.targetYear,
              reductionTargetPercentage: record.target.reductionTargetPercentage,
              baselineEmissionsCO2: record.target.baselineEmissionsCO2,
              comment: record.target.comment,
              organisation_id: organisationId,
              sector_id: sectorId,
            });
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
