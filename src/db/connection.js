const { Client } = require("pg");
const dbInfo = require("../config/db");

const dbConnection = () => {
  const client = new Client(dbInfo);

  client
    .connect()
    .then(() => {
      console.log("#####---> Postgres DB Connected!");

      // Optionally, you can run a simple query to check if the connection is valid:
      return client.query("SELECT NOW()");
    })
    .then((res) => {
      console.log("Postgres Time: ", res.rows[0]);

      // Close the connection
      return client.end();
    })
    .catch((err) => {
      console.error("Error *****: " + err);
      process.exit(1);
    });
};

exports.dbConnection = dbConnection;
