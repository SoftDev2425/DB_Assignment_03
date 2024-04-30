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

const scraper3 = async () => {
  return new Promise((resolve, reject) => {
    const csvFilePath = path.resolve(__dirname, "2016_Citywide_GHG_Emissions_20240207.csv");

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
          totalCityWideEmissionsCO2: isNaN(parseInt(data[11])) ? null : parseInt(data[11]),
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
              gassesIncluded: record.GHG_emissions.gassesIncluded,
              totalCityWideEmissionsCO2: record.GHG_emissions.totalCityWideEmissionsCO2,
              totalScope1_CO2: record.GHG_emissions.totalScope1CO2,
              totalScope2_CO2: record.GHG_emissions.totalScope2CO2,
              organisation_id: organisationId,
              emissionStatusType_id: emissionStatusTypeId,
            });
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
