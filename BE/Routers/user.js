const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const doQuery = require("../db/query");

const db = dbSingleton.getConnection();

// --- Validation Rules ---
const signupValidation = [
  body("username")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("שם המשתמש חייב להיות בין 4 ל-20 תווים")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("שם המשתמש יכול להכיל אותיות באנגלית, מספרים וקו תחתון בלבד"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("כתובת האימייל אינה תקינה")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 20 })
    .withMessage("הסיסמה חייבת להיות בין 8 ל-20 תווים")
    .matches(/[A-Za-z]/)
    .withMessage("הסיסמה חייבת להכיל לפחות אות אחת")
    .matches(/[0-9]/)
    .withMessage("הסיסמה חייבת להכיל לפחות מספר אחד"),
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("נא להזין כתובת אימייל תקינה")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("נא להזין סיסמה"),
];

const updateValidation = [
  body("username").optional().trim().isLength({ min: 4, max: 20 }),
  body("email").optional().trim().isEmail().normalizeEmail(),
  body("password").optional().isLength({ min: 8, max: 20 }),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// Get all users
router.get("/", (req, res) => {
  const query = "SELECT id, username, email FROM users";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "שגיאת שרת במסד הנתונים" });
    res.json(results);
  });
});

// User Signup
router.post("/signup", signupValidation, validate, async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const checkQuery = "SELECT id, email, username FROM users WHERE email = ? OR username = ? LIMIT 1";
    db.query(checkQuery, [email, username], async (err, results) => {
      if (err) return res.status(500).json({ message: "שגיאת שרת פנימית" });
      
      if (results.length > 0) {
        if (results[0].email === email) {
          return res.status(409).json({ message: "כתובת האימייל כבר קיימת במערכת" });
        }
        if (results[0].username === username) {
          return res.status(409).json({ message: "שם המשתמש כבר תפוס" });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const query = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
      db.query(query, [username, email, hashedPassword, "user"], (err2, results2) => {
        if (err2) {
          return res.status(500).json({ message: "שגיאה ביצירת המשתמש" });
        }
        res.status(201).json({ message: "החשבון נוצר בהצלחה!" });
      });
    });
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
});

// User Login
router.post("/login", loginValidation, validate, (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT id, username, email, password, role FROM users WHERE email = ? LIMIT 1";

  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "שגיאת שרת פנימית" });
    if (results.length === 0) {
      return res.status(401).json({ message: "האימייל או הסיסמה שגויים" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "האימייל או הסיסמה שגויים" });
    }

    const loggedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    req.session.user = loggedUser;
    res.json({ message: "התחברות הצליחה", user: loggedUser });
  });
});

// Get Profile
router.get("/profile", async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "לא מחובר" });
    }
    const { email } = req.session.user;
    const query = "SELECT id, username, email, password, role FROM users WHERE email = ? LIMIT 1";

    db.query(query, [email], (err, results) => {
      if (err) return res.status(500).json({ message: "שגיאת שרת" });
      if (results.length === 0) {
        return res.status(401).json({ message: "משתמש לא נמצא" });
      }
      const user = results[0];
      const loggedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      res.status(200).json({ message: "הפרופיל נטען בהצלחה", user: loggedUser });
    });
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
});

// Logout
router.post("/logout", async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "ההתנתקות בוצעה בהצלחה" });
    });
  } catch (error) {
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
});


// Change Password
router.put("/change-password/:id", async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "נא למלא את כל השדות" });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: "הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "הסיסמה החדשה חייבת להכיל לפחות 8 תווים" });
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
        if (err2) return res.status(500).json({ message: "שגיאה בעדכון הסיסמה" });
        res.json({ message: "הסיסמה עודכנה בהצלחה!" });
      });
    });
  } catch (err) {
    res.status(500).json({ message: "שגיאה פנימית" });
  }
});


// Get user by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT id, username, email FROM users WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "שגיאת שרת" });
    if (results.length === 0) return res.status(404).json({ message: "משתמש לא נמצא" });
    res.json(results[0]);
  });
});


// Update user by ID
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
      if (err) return res.status(500).json({ message: "עדכון הנתונים נכשל" });
      if (results.affectedRows === 0) return res.status(404).json({ message: "משתמש לא נמצא" });
      res.json({ message: "הפרופיל עודכן בהצלחה" });
    });
  } catch (err) {
    res.status(500).json({ message: "שגיאה בעיבוד הבקשה" });
  }
});

// Delete User
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "מחיקת המשתמש נכשלה" });
    res.json({ message: "המשתמש נמחק בהצלחה" });
  });
});

module.exports = router;