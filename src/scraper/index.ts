import dotenv from "dotenv";
dotenv.config();
import scraper1 from "./scraper1/scraper";
import scraper2 from "./scraper2/scraper";
import scraper3 from "./scraper3/scraper";
import scraper4 from "./scraper4/scraper";
import scraper5 from "./scraper5/scraper";
import mongoose from "mongoose";

export const scrapeAndInsertIntoDatabase = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/db-assignment-2");

    await mongoose.connection.db.dropDatabase();

    await scraper1();
    await scraper2();
    await scraper3();
    await scraper4();
    await scraper5();

    await mongoose.disconnect();
    console.log("All scrapers done! Now you start the server by running: \n    'npm run dev'");
  } catch (error) {
    await mongoose.disconnect();
    console.error("Error occurred while running scrapers:", error);
  }
};

scrapeAndInsertIntoDatabase();
