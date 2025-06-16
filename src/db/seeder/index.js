#!/usr/bin/env node

require("dotenv").config();
const { Pool } = require("pg");
const dbInfo = require("../../config/db");

const seeders = {
  user_roles: require("./user_roles"),
  users: require("./users"),
  districts: require("./districts"),
};

const pool = new Pool(dbInfo);

const runSeeders = async (seederNames) => {
  const client = await pool.connect();

  try {
    if (seederNames.length === 0) {
      // Run all if no specific seeder is mentioned
      for (const [name, seeder] of Object.entries(seeders)) {
        console.log(`➡️  Running ${name} seeder...`);
        await seeder(client);
      }
    } else {
      for (const name of seederNames) {
        const seeder = seeders[name];
        if (!seeder) {
          console.error(`❌ Seeder "${name}" not found.`);
          continue;
        }
        console.log(`➡️  Running ${name} seeder...`);
        await seeder(client);
      }
    }

    console.log("✅ Seeding complete.");
  } catch (err) {
    console.error("Error running seeders:", err);
  } finally {
    client.release();
    await pool.end();
  }
};

const seederArgs = process.argv.slice(2);

runSeeders(seederArgs).catch((err) => {
  console.error("Error running seeders:", err);
  process.exit(1);
});
