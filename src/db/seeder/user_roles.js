module.exports = async (client) => {
  const userTypes = ["Admin", "QC", "Field Surveyor"];

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  for (const name of userTypes) {
    const slug = generateSlug(name);

    // Use INSERT ... ON CONFLICT and RETURNING id
    await client.query(
      `
        INSERT INTO user_roles (name, slug)
        VALUES ($1, $2)
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name
        RETURNING id;
      `,
      [name, slug]
    );
  }

  console.log("✅ user_roles table seeded successfully.");
};
