module.exports = async (client) => {
  await client.query(`
      CREATE TABLE IF NOT EXISTS crops (
        id SERIAL PRIMARY KEY,
        crop_name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE
      );
    `);

  console.log("✅ crops table migrated successfully.");
};
