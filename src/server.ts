import Fastify from "fastify";
import { emissionRoutes } from "./routes/emission";
import cors from "@fastify/cors";
import mongoose from "mongoose";

declare module "fastify" {
  export interface FastifyRequest {}
}

export async function buildServer() {
  const fastify = Fastify({ logger: true });

  fastify.register(cors, {
    origin: ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000"],
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
  });

  mongoose
    .connect("mongodb://localhost:27017/db-assignment-2")
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log("Error connecting to db", err);
    });

  fastify.get("/", async function (request, reply) {
    return { msg: "Hello from DB assignment 1" };
  });

  fastify.register(emissionRoutes, { prefix: "/api/emissions" });

  return fastify;
}