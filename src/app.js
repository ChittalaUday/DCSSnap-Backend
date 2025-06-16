const express = require("express");
const path = require("path");
const cors = require("cors");
const expressSession = require("express-session");
const morgan = require("morgan");
const routes = require("./routes");
const { dbConnection } = require("./db/connection.js");

exports.server = function () {
  const server = express();

  const create = async (config) => {
    server.set("env", config.env);
    server.set("host", config.host);
    server.set("port", config.port);

    const corsOptions = {
      origin: ["*"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    };

    server.use(cors(corsOptions));

    server.use("/public", express.static(path.join(__dirname, "../public/")));

    server.use(morgan("dev"));

    server.use(express.json({ limit: "5mb" }));

    server.use(express.urlencoded({ extended: true }));

    server.use(
      expressSession({
        key: "user_id",
        secret: process.env.SECRET_KEY || "Niruthi_Dev",
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          secure: config.env === "production",
          httpOnly: true,
          sameSite: "lax",
        },
      })
    );

    try {
      await dbConnection();
    } catch (err) {
      console.error("Database connection error:", err);
      process.exit(1);
    }

    routes.init(server);

    // Add error handling middleware
    server.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(err.status || 500).json({
        error: {
          message: err.message || "Internal Server Error",
          status: err.status || 500,
        },
      });
    });

    // Handle 404 errors
    server.use((req, res) => {
      res.status(404).json({
        error: {
          message: "Not Found",
          status: 404,
        },
      });
    });
  };

  const start = (config) => {
    let host = server.get("host"),
      port = server.get("port");

    server.listen(port, () => {
      console.log(
        `Express Server is listening on: http${
          config.env === "production" ? "s" : ""
        }://${host}:${port}`
      );
    });
  };

  return {
    create: create,
    start: start,
  };
};
