module.exports = async (client) => {
  await client.query(`
        CREATE TABLE IF NOT EXISTS districts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(100) NOT NULL UNIQUE
        );
      `);

  console.log("✅ districts table migrated successfully.");
};
