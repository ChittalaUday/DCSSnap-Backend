const express = require("express");
const router = express.Router();
const {
  verifyToken,
  verifyAdmin,
  verifyAdminOrQC,
} = require("../../middlewares/authMiddleware");

const UserController = require("../../controllers/UserController");

router.post("/login", UserController.login);

router.use(verifyToken);

router.get("/:id/data", UserController.getUserData);

router.use(verifyAdminOrQC);
router.get("/", UserController.getUsers);

router.use(verifyAdmin);

router.post("/register", verifyAdmin, UserController.register);
router.put("/update/:id", UserController.updateUserById);
router.delete("/delete/:id", UserController.deleteUserById);

module.exports = router;
