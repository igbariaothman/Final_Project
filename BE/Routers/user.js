const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");
const bcrypt = require('bcrypt');



// Execute a query to the database
const db = dbSingleton.getConnection();

router.get("/", (req, res) => {
  const query = "SELECT id, username, email FROM users";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

//for signup with validation using express-validator
const{ body, validationResult } = require('express-validator');

//test password and email validation in signup
router.post("/signup",
  [
    body("username")
    .trim()
    .isLength ({ min: 4 , max: 20 })
    .withMessage("Username must be between 4 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

    body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

    body("password")
    .isLength({ min: 8  , max: 20 })
    .withMessage("Password must be between 8 and 20 characters")
    .matches(/[A-Za-z]/).withMessage("Password must contain at least one letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number")

  ],
 async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }
    const { username, email, password } = req.body;

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(query, [username, email, hashedPassword], (err, results) => {
   if(err) {
if (err) {
  if (err.code === "ER_DUP_ENTRY") {
    if (err.sqlMessage && err.sqlMessage.includes("email")) {
      return res.status(409).json({ message: "Email already exists" });
    }
    if (err.sqlMessage && err.sqlMessage.includes("username")) {
      return res.status(409).json({ message: "Username already exists" });
    }
    return res.status(409).json({ message: "Duplicate value" });
  }
  console.error(err);
  return res.status(500).json({ message: "Server error" });
}
   }
    res.status(201).json({ message: "User created!" });
    });
  }
);



   //login with email and password and use bcrypt to compare passwords and epress-validator for validation
   router.post("/login",
   [
    body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

    body("password")
    .isLength({ min: 8 , max: 20 })
    .withMessage("Password must be between 8 and 20 characters")
    ],
    async (req, res) => { 
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      const query = "SELECT id , username, email, password FROM users WHERE email = ? LIMIT 1";
      db.query(query, [email], async (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send("Server error");
          return;
        }
        if (results.length === 0) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
       if (!passwordMatch) {
  return res.status(401).json({ message: "Invalid email or password" });
}

        res.json({ message: "Login successful!", user: { id: user.id, username: user.username, email: user.email } });
      });
    }
    );



//update User with hashing password 
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;
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
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: "User updated!" });
  });
});


//Delete User
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: "User deleted!" });
  });
});

module.exports = router;
