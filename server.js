require("dotenv").config();
const app = require("./src/app.js");
const config = require("./src/config/env");

const server = app.server();

server.create(config).then(() => {
  server.start(config);
});
