const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const db = require("../db/pool");

const UserController = {
  async register(req, res) {
    const client = await db.connect();
    const { name, email, mobile, password, role, assigned_districts } =
      req.body;

    if (!email || !mobile || !password || !role || !name) {
      return res.status(400).json({
        error: "email, mobile, password, role, and name are required.",
      });
    }

    try {
      const userExists = await client.query(
        "SELECT * FROM users WHERE email = $1 OR mobile = $2",
        [email, mobile]
      );
      if (userExists.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "Email or mobile number already registered." });
      }

      const userRoleResult = await client.query(
        "SELECT id FROM user_roles WHERE slug = $1",
        [role]
      );
      if (userRoleResult.rows.length === 0) {
        return res.status(400).json({ error: "Invalid user role provided." });
      }

      let districtIds = [];
      if (assigned_districts && assigned_districts.length > 0) {
        // checks contains duplicate districts
        if (assigned_districts.length !== new Set(assigned_districts).size) {
          return res
            .status(400)
            .json({ error: "Duplicate districts provided." });
        }

        // check if all the districts are valid
        for (const district of assigned_districts) {
          const districtResult = await client.query(
            "SELECT id FROM districts WHERE slug = $1",
            [district]
          );
          if (districtResult.rows.length === 0) {
            return res
              .status(400)
              .json({ error: "Invalid district provided: " + district });
          }
        }

        //get all the districts id
        const districtResult = await client.query(
          "SELECT id FROM districts WHERE slug = ANY($1)",
          [assigned_districts]
        );
        districtIds = districtResult.rows.map((district) => district.id);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertResult = await client.query(
        `INSERT INTO users (name, email, mobile, password, role, assigned_districts)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, name`,
        [
          name,
          email,
          mobile,
          hashedPassword,
          userRoleResult.rows[0].id,
          districtIds,
        ]
      );

      const newUser = insertResult.rows[0];
      const token = jwt.sign(
        { id: newUser.id, role: userRoleResult.rows[0].slug },
        JWT_SECRET,
        {
          expiresIn: "4h",
        }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user_id: newUser.id,
        email: newUser.email,
        mobile: newUser.mobile,
        name: newUser.name,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error during registration." });
    } finally {
      client.release();
    }
  },

  async login(req, res) {
    const client = await db.connect();
    const { email, mobile, password } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({ error: "email or mobile is required." });
    }

    if (!password) {
      return res.status(400).json({ error: "password is required." });
    }

    try {
      const result = await client.query(
        "SELECT * FROM users WHERE email = $1 OR mobile = $2",
        [email, mobile]
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(400).json({ error: "Invalid credentials." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials." });
      }

      const userRole = await client.query(
        "SELECT slug FROM user_roles WHERE id = $1",
        [user?.role]
      );

      const token = jwt.sign(
        { id: user.id, role: userRole?.rows[0]?.slug },
        JWT_SECRET,
        {
          expiresIn: "4h",
        }
      );

      res.json({
        message: "Login successful",
        token,
        email: user?.email,
        mobile: user?.mobile,
        name: user?.name,
        role: userRole?.rows[0]?.slug || "user",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error during login." });
    } finally {
      client.release();
    }
  },

  // Get users or specific user by ID
  async getUsers(req, res) {
    const client = await db.connect(); // Connect to the database
    try {
      const { id } = req.params;

      let query = "SELECT * FROM users";
      let params = [];

      if (id) {
        query += " WHERE id = $1";
        params.push(id);
      }

      const result = await client.query(query, params);
      res.json({ success: true, users: result.rows });
    } catch (error) {
      console.error("Error fetching users:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch users" });
    } finally {
      client.release(); // Release the client back to the pool
    }
  },

  async updateUserById(req, res) {
    const client = await db.connect();
    const { id } = req.params;
    const { name, email, mobile, password, role, assigned_districts } =
      req.body;

    if (!id) {
      return res.status(400).json({ error: "id is required." });
    }

    try {
      // Check if user exists
      const user = await client.query("SELECT * FROM users WHERE id = $1", [
        id,
      ]);
      if (user.rows.length === 0) {
        return res.status(400).json({ error: "User not found." });
      }

      // Validate role if provided
      if (role) {
        const roleResult = await client.query(
          "SELECT id FROM user_roles WHERE slug = $1",
          [role]
        );
        if (roleResult.rows.length === 0) {
          return res.status(400).json({ error: "Invalid role provided." });
        }
        role = roleResult.rows[0].id;
      }

      // Hash password if provided
      if (password) {
        password = await bcrypt.hash(password, 10);
      }

      // Update user
      const updateResult = await client.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             mobile = COALESCE($3, mobile),
             password = COALESCE($4, password),
             role = COALESCE($5, role),
             assigned_districts = COALESCE($6, assigned_districts)
         WHERE id = $7
         RETURNING id, name, email, mobile, role, assigned_districts`,
        [name, email, mobile, password, role, assigned_districts, id]
      );

      res.json({
        message: "User updated successfully",
        user: updateResult.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error during user update." });
    } finally {
      client.release();
    }
  },

  async deleteUserById(req, res) {
    const client = await db.connect();
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "id is required." });
    }

    try {
      const deleteResult = await client.query(
        "DELETE FROM users WHERE id = $1",
        [id]
      );
      res.json({
        message: "User deleted successfully",
        user: deleteResult.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error during user deletion." });
    } finally {
      client.release();
    }
  },

  async getUserData(req, res) {
    const client = await db.connect();
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required." });
    }

    try {
      const result = await client.query(
        `SELECT u.*, ur.slug as role_name 
         FROM users u
         JOIN user_roles ur ON u.role = ur.id 
         WHERE ur.id = 3 AND u.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found or not authorized to access this data.",
        });
      }

      const userData = result.rows[0];
      // Remove sensitive information
      delete userData.password;

      res.json({
        success: true,
        data: userData,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error while fetching user data." });
    } finally {
      client.release();
    }
  },
};

module.exports = UserController;
