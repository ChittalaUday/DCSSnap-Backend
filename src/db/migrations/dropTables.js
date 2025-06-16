module.exports = async (client) => {
  await client.query(`
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS user_roles;
    DROP TABLE IF EXISTS districts;
  `);

  console.log("✅ tables dropped successfully.");
};
