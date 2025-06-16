module.exports = async (client) => {
  await client.query(`
      INSERT INTO users (name,email,mobile, password, role)
      VALUES (
        'Niruthi Admin',
        'admin@niruthi.com',
        '9876543210',
        '$2a$10$tMKm8huj6PyxTeOlRVHc7Oh9IwgXZQyCVzcpABVWgAHR1SC3Hmej6',
        1
      )
    `);

  console.log("✅ user table seeded successfully.");
};
