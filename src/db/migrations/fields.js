module.exports = async (client) => {
  await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
      CREATE TABLE IF NOT EXISTS fields (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bundle_id UUID NOT NULL REFERENCES bundles(bundle_id) ON DELETE CASCADE,
        crop_name VARCHAR NOT NULL REFERENCES crops(id),
        crop_stage VARCHAR NOT NULL REFERENCES stages(id),
        sowing_date DATE NOT NULL,
        status VARCHAR NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
        photo_url TEXT,
        user_latitude DECIMAL(10, 8),
        user_longitude DECIMAL(11, 8),
        field_latitude DECIMAL(10, 8),
        field_longitude DECIMAL(11, 8),
        photo_latitude DECIMAL(10, 8),
        photo_longitude DECIMAL(11, 8),
        district VARCHAR,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

  console.log("✅ fields table migrated successfully.");
};
