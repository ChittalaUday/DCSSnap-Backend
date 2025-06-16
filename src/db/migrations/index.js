#!/usr/bin/env node

require("dotenv").config();
const { Pool } = require("pg");
const dbInfo = require("../../config/db");

const migrations = {
  dropTables: require("./dropTables"),
  user_roles: require("./user_roles"),
  users: require("./users"),
  districts: require("./districts"),
  crops: require("./crops"),
  stages: require("./stages"),
  bundles: require("./bundle"),
  fields: require("./fields"),
};

const pool = new Pool(dbInfo);

const runMigrations = async (migrationNames) => {
  const client = await pool.connect();

  try {
    if (migrationNames.length === 0) {
      // Run all if no specific migration is mentioned
      for (const [name, migration] of Object.entries(migrations)) {
        console.log(`➡️  Running ${name} migration...`);
        await migration(client);
      }
    } else {
      for (const name of migrationNames) {
        const migration = migrations[name];
        if (!migration) {
          console.error(`❌ Migration "${name}" not found.`);
          continue;
        }
        console.log(`➡️  Running ${name} migration...`);
        await migration(client);
      }
    }

    console.log("✅ Migrations complete.");
  } catch (err) {
    console.error("❌ Error running migrations:", err);
  } finally {
    client.release();
    await pool.end();
  }
};

const migrationArgs = process.argv.slice(2);

module.exports = runMigrations(migrationArgs).catch((err) => {
  console.error("❌ Error in migration runner:", err);
  process.exit(1);
});
