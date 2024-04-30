import Fastify from "fastify";
import { emissionRoutes } from "./routes/emission";
import cors from "@fastify/cors";
import neo4j from "neo4j-driver";

declare module "fastify" {
  export interface FastifyRequest {}
}

export async function buildServer() {
  const fastify = Fastify({ logger: true });

  fastify.register(cors, {
    origin: ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000"],
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
  });

  const credentials = {
    host: "neo4j://localhost:7687",
    user: "neo4j",
    password: "<your-secret-password>",
  };

  const _driver = neo4j.driver(credentials.host, neo4j.auth.basic(credentials.user, credentials.password));

  // mongoose
  //   .connect("mongodb://localhost:27017/db-assignment-2")
  //   .then(() => {
  //     console.log("Connected to MongoDB");
  //   })
  //   .catch((err) => {
  //     console.log("Error connecting to db", err);
  //   });

  fastify.get("/", async function (request, reply) {
    return { msg: "Hello from DB assignment 1" };
  });

  fastify.register(emissionRoutes, { prefix: "/api/emissions" });

  return fastify;
}
