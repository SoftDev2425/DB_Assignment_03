import dotenv from "dotenv";
dotenv.config();
import { cypher } from "../utils/dbConnection";
import scraper1 from "./scraper1/scraper";
import scraper2 from "./scraper2/scraper";
import scraper3 from "./scraper3/scraper";
import scraper4 from "./scraper4/scraper";
import scraper5 from "./scraper5/scraper";

export const scrapeAndInsertIntoDatabase = async () => {
  try {
    // CLEAR DATABASE
    await cypher(`match (a) -[r] -> () delete a, r`);
    await cypher(`match (a) delete a`);

    await scraper1();
    await scraper2();
    await scraper3();
    await scraper4();
    await scraper5();

    console.log("All scrapers done! Now you start the server by running: \n    'npm run dev'");
    process.exit();
  } catch (error) {
    console.error("Error occurred while running scrapers:", error);
    process.exit(1);
  }
};

scrapeAndInsertIntoDatabase();
