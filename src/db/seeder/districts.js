module.exports = async (client) => {
  const districts = ["District 1", "District 2", "District 3", "District 4"];

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  for (const name of districts) {
    const slug = generateSlug(name);

    // Use INSERT ... ON CONFLICT and RETURNING id
    await client.query(
      `
          INSERT INTO districts (name, slug)
          VALUES ($1, $2)
          ON CONFLICT (slug) DO UPDATE
          SET name = EXCLUDED.name
          RETURNING id;
        `,
      [name, slug]
    );
  }

  console.log("✅ districts table seeded successfully.");
};
