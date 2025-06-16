const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token missing or invalid." });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET); // You can access req.user.id in your routes
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired." });
    } else {
      return res.status(401).json({ error: "Unauthorized access." });
    }
  }
};

const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized access." });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

const verifyAdminOrQC = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin" && decoded.role !== "qc") {
      return res.status(403).json({ error: "Unauthorized access." });
    }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired." });
    } else {
      return res.status(401).json({ error: "Unauthorized access." });
    }
  }
};

module.exports = { verifyToken, verifyAdmin, verifyAdminOrQC };
