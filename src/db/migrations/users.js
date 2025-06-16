module.exports = async (client) => {
  await client.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        mobile VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role INT REFERENCES user_roles(id) NOT NULL,
        assigned_districts TEXT[] DEFAULT '{}',  
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    `);

  console.log("✅ users table migrated successfully");
};
