module.exports = async (client) => {
  await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
      CREATE TABLE IF NOT EXISTS bundles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id INT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

  console.log("✅ bundles table migrated successfully.");
};
