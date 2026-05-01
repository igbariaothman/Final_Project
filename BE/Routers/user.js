const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const db = dbSingleton.getConnection();


// --- 1. Validation Rules  signup---
const signupValidation = [
  body("username")
    .trim()
    .isLength({ min: 4, max: 20 }).withMessage("Username must be between 4 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .trim()
    .isEmail().withMessage("Invalid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 20 }).withMessage("Password must be between 8 and 20 characters")
    .matches(/[A-Za-z]/).withMessage("Password must contain at least one letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number")
];

// Login validation is simpler, just check for email and password presence and format
const loginValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
];

// Update validation allows optional fields but applies the same rules if they are provided
const updateValidation = [
  body("username").optional().trim().isLength({ min: 4, max: 20 }),
  body("email").optional().trim().isEmail().normalizeEmail(),
  body("password").optional().isLength({ min: 8, max: 20 })
];

// Validation Middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
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
    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(query, [username, email, hashedPassword], (err, results) => {
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
  const query = "SELECT id, username, email, password FROM users WHERE email = ? LIMIT 1";

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

    res.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email }
    });
  });
});

// Update User Profile
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