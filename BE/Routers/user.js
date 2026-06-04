const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const doQuery = require("../db/query");

const db = dbSingleton.getConnection();

const signupValidation = [
  body("username")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Username must be between 4 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain at least one letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateValidation = [
  body("username").optional().trim().isLength({ min: 4, max: 20 }),
  body("email").optional().trim().isEmail().normalizeEmail(),
  body("password").optional().isLength({ min: 8, max: 20 }),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map((err) => err.msg) });
  }
  next();
};

// Get all users
router.get("/", (req, res) => {
  const query = "SELECT id, username, email FROM users";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// User Signup
router.post("/signup", signupValidation, validate, async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(query, [username, email, hashedPassword, "user"], (err, results) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          const field = err.sqlMessage.includes("email") ? "Email" : "Username";
          return res.status(409).json({ message: `${field} already exists` });
        }
        return res.status(500).json({ message: "Error creating user" });
      }
      res.status(201).json({ message: "User created successfully" });
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// User Login
router.post("/login", loginValidation, validate, (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT id, username, email, password, role FROM users WHERE email = ? LIMIT 1";

  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const loggedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    req.session.user = loggedUser;
    res.json({ message: "Login successful", user: loggedUser });
  });
});

// Get Profile
router.get("/profile", async (req, res) => {
  try {
    const { email } = req.session.user;
    const query = "SELECT id, username, email, password, role FROM users WHERE email = ? LIMIT 1";

    db.query(query, [email], (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const user = results[0];
      const loggedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      res.status(200).json({ message: "User profile fetched successfully", user: loggedUser });
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout
router.post("/logout", async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logout successful" });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/change-password/:id", async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "נא למלא את כל השדות" });
  }

  try {
    db.query("SELECT password FROM users WHERE id = ?", [id], async (err, results) => {
      if (err) return res.status(500).json({ message: "שגיאת שרת" });
      if (results.length === 0) return res.status(404).json({ message: "משתמש לא נמצא" });

      const isMatch = await bcrypt.compare(currentPassword, results[0].password);
      if (!isMatch) {
        return res.status(401).json({ message: "הסיסמה הנוכחית שגויה" });
      }

      const hashedNew = await bcrypt.hash(newPassword, 10);
      db.query("UPDATE users SET password = ? WHERE id = ?", [hashedNew, id], (err2) => {
        if (err2) return res.status(500).json({ message: "שגיאה בעדכון" });
        res.json({ message: "הסיסמה עודכנה בהצלחה!" });
      });
    });
  } catch (err) {
    res.status(500).json({ message: "שגיאה פנימית" });
  }
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT id, username, email FROM users WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
});


router.put("/:id", updateValidation, validate, async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  try {
    let query, params;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?";
      params = [username, email, hashedPassword, id];
    } else {
      query = "UPDATE users SET username = ?, email = ? WHERE id = ?";
      params = [username, email, id];
    }

    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      if (results.affectedRows === 0) return res.status(404).json({ message: "User not found" });
      res.json({ message: "Profile updated successfully" });
    });
  } catch (err) {
    res.status(500).json({ message: "Error processing request" });
  }
});

// Delete User
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({ message: "User deleted successfully" });
  });
});

module.exports = router;