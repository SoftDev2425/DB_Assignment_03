import { buildServer } from "./server";

async function startServer() {
  const server = await buildServer();

  server.listen({ port: 3000, host: "localhost" }, function (err, address) {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }

    server.log.info(`server listening on ${address}`);
  });

  //@ts-ignore
  [("SIGINT", "SIGTERM")].forEach((signal) => {
    process.on(signal, async () => {
      await server.close();
      process.exit(0);
    });
  });
}

startServer();