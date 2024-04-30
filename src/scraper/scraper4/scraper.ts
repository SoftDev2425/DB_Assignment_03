import fs from "fs";
import { parse } from "csv-parse";
import { format } from "date-fns";
import * as path from "path";
import Countries from "../../models/countries";
import Cities from "../../models/cities";
import Populations from "../../models/populations";
import Organisations from "../../models/organisations";
import EmissionStatusTypes from "../../models/emissionStatusTypes";
import GHG_Emissions from "../../models/GHG_Emissions";

const scraper4 = async () => {
  return new Promise((resolve, reject) => {
    const csvFilePath = path.resolve(__dirname, "2017_Cities_Community_Wide_Emissions.csv");

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
          C40Status: data[5].trim() == "C40" ? true : false,
          population: {
            count: parseInt(data[20]) || null,
            year: parseInt(data[21]) || null,
          },
        };

        const emissionStatusTypes = {
          type: data[18].trim() || "",
        };

        const GHG_emissions = {
          reportingYear: isNaN(parseInt(data[7])) ? null : parseInt(data[7]),
          measurementYear: data[8]
            .split(" - ")
            .map((date: string | number | Date) => format(new Date(date), "yyyy-MM-dd"))[1]
            .split("-")[0],
          boundary: data[9].trim() || "",
          methodology: data[10].trim() || "",
          methodologyDetails: data[11].trim() || "",
          description: data[19].trim() || "",
          comment: data[17].trim() || "",
          gassesIncluded: data[12].trim() || "",
          totalCityWideEmissionsCO2: isNaN(parseInt(data[13])) ? null : parseInt(data[13]),
          totalScope1CO2: isNaN(parseInt(data[15])) ? null : parseInt(data[15]),
          totalScope2CO2: isNaN(parseInt(data[16])) ? null : parseInt(data[16]),
        };

        obj.organisation = organisation;
        obj.country = country;
        obj.city = city;
        obj.emissionStatusTypes = emissionStatusTypes;
        obj.GHG_emissions = GHG_emissions;

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
              { $set: { name: record.country.name, regionName: record.country.regionName } },
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

            // capture the city id
            const cityId = newCity.upsertedId
              ? newCity.upsertedId._id
              : (await Cities.findOne({ name: record.city.name }))?._id;

            // create population
            const newPopulation = await Populations.create({
              count: record.city.population.count,
              year: record.city.population.year,
              city_id: cityId,
            });

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

            // create emissionStatusType
            const newEmissionStatusType = await EmissionStatusTypes.updateOne(
              { type: record.emissionStatusTypes.type },
              { $setOnInsert: { type: record.emissionStatusTypes.type } },
              { upsert: true }
            );

            // capture the emissionStatusType id
            const emissionStatusTypeId = newEmissionStatusType.upsertedId
              ? newEmissionStatusType.upsertedId._id
              : (await EmissionStatusTypes.findOne({ type: record.emissionStatusTypes.type }))?._id;

            // create new GHG_EmissionStatus
            await GHG_Emissions.create({
              reportingYear: record.GHG_emissions.reportingYear,
              measurementYear: record.GHG_emissions.measurementYear,
              boundary: record.GHG_emissions.boundary,
              methodology: record.GHG_emissions.methodology,
              methodologyDetails: record.GHG_emissions.methodologyDetails,
              description: record.GHG_emissions.description,
              comment: record.GHG_emissions.comment,
              gassesIncluded: record.GHG_emissions.gassesIncluded,
              totalCityWideEmissionsCO2: record.GHG_emissions.totalCityWideEmissionsCO2,
              totalScope1_CO2: record.GHG_emissions.totalScope1CO2,
              totalScope2_CO2: record.GHG_emissions.totalScope2CO2,
              organisation_id: organisationId,
              emissionStatusType_id: emissionStatusTypeId,
            });
          }

          console.log("Scraper 4 done!");
          resolve("Scraper 4 done!");
        } catch (error) {
          reject(error);
        }
      });
  });
};

export default scraper4;
