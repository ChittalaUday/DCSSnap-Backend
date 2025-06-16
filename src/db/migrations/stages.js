module.exports = async (client) => {
  await client.query(`
      CREATE TABLE IF NOT EXISTS stages (
        id SERIAL PRIMARY KEY,
        crop_id INT NOT NULL REFERENCES crops(id),
        stage_name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE
      );
    `);

  console.log("✅ user_roles table migrated successfully.");
};
