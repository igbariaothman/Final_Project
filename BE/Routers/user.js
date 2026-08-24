const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = dbSingleton.getConnection();

// --- הגדרות Multer להעלאת תמונת פרופיל ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/profiles/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("רק קבצי תמונה מותרים!"), false);
    }
  },
});

// --- ולידציה ---
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
  body("email").trim().isEmail().withMessage("נא להזין כתובת אימייל תקינה").normalizeEmail(),
  body("password").notEmpty().withMessage("נא להזין סיסמה"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// Signup
router.post("/signup", signupValidation, validate, async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const checkQuery = "SELECT id, email, username FROM users WHERE email = ? OR username = ? LIMIT 1";
    db.query(checkQuery, [email, username], async (err, results) => {
      if (err) return res.status(500).json({ message: "שגיאת שרת פנימית" });

      if (results.length > 0) {
        if (results[0].email === email) return res.status(409).json({ message: "כתובת האימייל כבר קיימת" });
        if (results[0].username === username) return res.status(409).json({ message: "שם המשתמש כבר תפוס" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const query = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
      db.query(query, [username, email, hashedPassword, "user"], (err2) => {
        if (err2) return res.status(500).json({ message: "שגיאה ביצירת המשתמש" });
        res.status(201).json({ message: "החשבון נוצר בהצלחה!" });
      });
    });
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
});

// Login
router.post("/login", loginValidation, validate, (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT id, username, email, password, role, profileImage, lastUsernameChange FROM users WHERE email = ? LIMIT 1";

  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "שגיאת שרת פנימית" });
    if (results.length === 0) return res.status(401).json({ message: "האימייל או הסיסמה שגויים" });

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: "האימייל או הסיסמה שגויים" });

    const loggedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      lastUsernameChange: user.lastUsernameChange,
    };
    req.session.user = loggedUser;
    res.json({ message: "התחברות הצליחה", user: loggedUser });
  });
});

// Get Profile
router.get("/profile", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "לא מחובר" });
  }
  const { email } = req.session.user;
  const query = "SELECT id, username, email, role, profileImage, lastUsernameChange FROM users WHERE email = ? LIMIT 1";

  db.query(query, [email], (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: "משתמש לא נמצא" });
    const user = results[0];
    req.session.user = user;
    res.status(200).json({ user });
  });
});

// Logout
router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "ההתנתקות בוצעה בהצלחה" });
  });
});

// עדכון פרופיל (שם משתמש + תמונה) עם בדיקת 14 יום
router.put("/update-profile/:id", upload.single("profileImage"), async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: "משתמש לא נמצא" });

    const user = results[0];
    let newUsername = user.username;
    let updateTime = false;

    // בדיקת שינוי שם משתמש
    if (username && username.trim() !== user.username) {
      const cleanName = username.trim();

      if (cleanName.length < 4 || cleanName.length > 20 || !/^[a-zA-Z0-9_]+$/.test(cleanName)) {
        return res.status(400).json({ message: "שם משתמש אינו תקין (4-20 תווים, אותיות באנגלית, מספרים וקו תחתון בלבד)" });
      }

      if (user.lastUsernameChange) {
        const lastChange = new Date(user.lastUsernameChange);
        const now = new Date();
        const diffInDays = (now - lastChange) / (1000 * 60 * 60 * 24);

        if (diffInDays < 14) {
          const daysLeft = Math.ceil(14 - diffInDays);
          return res.status(400).json({ message: `ניתן לשנות שם משתמש רק פעם ב-14 ימים. נותרו עוד ${daysLeft} ימים.` });
        }
      }

      newUsername = cleanName;
      updateTime = true;
    }

    // טיפול בתמונה חדשה
    let newImagePath = user.profileImage;
    if (req.file) {
      newImagePath = `/uploads/profiles/${req.file.filename}`;
    }

    // בדיקת כפילות שם משתמש אם השתנה
    const checkNameSql = "SELECT id FROM users WHERE username = ? AND id != ?";
    db.query(checkNameSql, [newUsername, id], (checkErr, checkRows) => {
      if (checkRows && checkRows.length > 0) {
        return res.status(409).json({ message: "שם המשתמש כבר תפוס על ידי משתמש אחר" });
      }

      const updateSql = `
        UPDATE users 
        SET username = ?, profileImage = ?, lastUsernameChange = IF(? = 1, NOW(), lastUsernameChange)
        WHERE id = ?
      `;

      db.query(updateSql, [newUsername, newImagePath, updateTime ? 1 : 0, id], (upErr) => {
        if (upErr) return res.status(500).json({ message: "שגיאה בעדכון הפרופיל" });

        const updatedUser = {
          ...user,
          username: newUsername,
          profileImage: newImagePath,
          lastUsernameChange: updateTime ? new Date() : user.lastUsernameChange,
        };

        if (req.session.user) {
          req.session.user = updatedUser;
        }

        res.json({ message: "הפרופיל עודכן בהצלחה!", user: updatedUser });
      });
    });
  });
});

// שינוי סיסמה
router.put("/change-password/:id", async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) return res.status(400).json({ message: "נא למלא את כל השדות" });
  if (currentPassword === newPassword) return res.status(400).json({ message: "הסיסמה החדשה חייבת להיות שונה" });
  if (newPassword.length < 8) return res.status(400).json({ message: "לפחות 8 תווים לסיסמה" });

  db.query("SELECT password FROM users WHERE id = ?", [id], async (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: "משתמש לא נמצא" });

    const isMatch = await bcrypt.compare(currentPassword, results[0].password);
    if (!isMatch) return res.status(401).json({ message: "הסיסמה הנוכחית שגויה" });

    const hashedNew = await bcrypt.hash(newPassword, 10);
    db.query("UPDATE users SET password = ? WHERE id = ?", [hashedNew, id], (err2) => {
      if (err2) return res.status(500).json({ message: "שגיאה בעדכון הסיסמה" });
      res.json({ message: "הסיסמה עודכנה בהצלחה!" });
    });
  });
});

// Get user by ID (עבור פרופיל ציבורי לפי מזהה)
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT id, username, email, role, profileImage FROM users WHERE id = ?";
  
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "שגיאת שרת" });
    if (results.length === 0) return res.status(404).json({ message: "משתמש לא נמצא" });
    res.json(results[0]);
  });
});

module.exports = router;