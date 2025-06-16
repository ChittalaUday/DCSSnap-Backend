const express = require("express");
const router = express.Router();
const userRoutes = require("./api/user");

const init = (server) => {
  // Logging middleware
  server.use((req, res, next) => {
    console.log(
      "Request was made to : " +
        req.method +
        " -> " +
        req.originalUrl +
        "\n*******************"
    );
    next();
  });

  router.use("/users", userRoutes);

  // API routes
  server.use("/api", router);

  // Error handling middleware
  server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
  });
};

module.exports = { init };
