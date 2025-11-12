const Hapi = require("@hapi/hapi");
const pool = require("./config/database");
require("dotenv").config();
const routes = require("./routes");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || "localhost",
    routes: {
      cors: {
        origin: ["*"],
        headers: ["Accept", "Content-Type"],
        additionalHeaders: ["X-Requested-With"],
      },
    },
  });

  server.route(routes);

  await server.start();
};

process.on("unhandledRejection", () => {
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});

init();
