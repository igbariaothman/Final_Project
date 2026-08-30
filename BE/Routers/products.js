/**
 * מודול: נתיבי שרת לניהול מוצרים (Products Routes)
 * תפקיד: הוספה, עדכון, מחיקה, סימון כנמכר, שליפת מוצרים והעלאת קובצי תמונות
 */

const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const db = dbSingleton.getConnection();

// --- הגדרות Multer להעלאת תמונות ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // מגבלת גודל: עד 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("רק קבצי תמונה מותרים להעלאה!"), false);
    }
  },
});

// --- כללי אימות קלט למוצר ---
const productValidation = [
  body("productName").trim().notEmpty().withMessage("שם המוצר הוא שדה חובה"),
  body("price").isNumeric().withMessage("המחיר חייב להיות מספר תקין"),
  body("category").trim().notEmpty().withMessage("בחירת קטגוריה היא שדה חובה"),
  body("description").trim().notEmpty().withMessage("תיאור המוצר הוא שדה חובה"),
  body("userId").isInt().withMessage("מזהה משתמש לא תקין"),
  body("listingType").isIn(["sale", "donation"]).withMessage("סוג מודעה לא תקין"),
  body("productstatus").isIn(["new", "like-new", "good", "fair"]).withMessage("מצב מוצר לא תקין"),
];

// פונקציית תיווך לבדיקת שגיאות אימות
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// --- נתיבי שרת (Routes) ---

// שליפת כל המוצרים הקיימים במערכת
router.get("/", (req, res) => {
  const query = `
    SELECT p.*, u.username 
    FROM products p 
    JOIN users u ON p.userId = u.id 
    ORDER BY p.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "שגיאה בטעינת הנתונים" });

    const formattedResults = results.map((product) => ({
      ...product,
      images: JSON.parse(product.images || "[]"),
    }));
    res.json(formattedResults);
  });
});

// שליפת פרטי מוצר בודד לפי מזהה
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT p.*, u.username , u.profileImage
    FROM products p 
    JOIN users u ON p.userId = u.id 
    WHERE p.productId = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "שגיאה בטעינת המוצר" });
    if (results.length === 0) return res.status(404).json({ message: "המוצר לא נמצא" });

    const product = {
      ...results[0],
      images: JSON.parse(results[0].images || "[]"),
    };
    res.json(product);
  });
});

// הוספת מוצר חדש כולל העלאת תמונות ושמירתן
router.post("/addProduct", upload.array("images", 10), productValidation, validate, (req, res) => {
  const { productName, price, category, description, userId, listingType, productstatus } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "חובה להעלות לפחות תמונה אחת" });
  }

  const imagesPaths = req.files.map((file) => `/uploads/${file.filename}`);
  const query = `
    INSERT INTO products 
    (productName, price, category, description, userId, images, listingType, productstatus) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [productName, price, category, description, userId, JSON.stringify(imagesPaths), listingType, productstatus],
    (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ message: "שגיאה במסד הנתונים בעת הוספת המוצר" });
      }
      res.status(201).json({
        message: "המוצר נוסף בהצלחה",
        productId: results.insertId,
        images: imagesPaths,
      });
    }
  );
});

// עדכון סטטוס מוצר לנמכר
router.put("/sold/:id", (req, res) => {
  const { id } = req.params;
  const query = "UPDATE products SET status = 'sold' WHERE productId = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "עדכון מצב המכירה נכשל" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "המוצר לא נמצא" });
    }
    res.json({ message: "המוצר סומן כנמכר בהצלחה" });
  });
});

// עדכון פרטי מוצר קיימים
router.put("/:id", productValidation, validate, (req, res) => {
  const { id } = req.params;
  const { productName, price, category, description, listingType } = req.body;

  const query =
    "UPDATE products SET productName = ?, price = ?, category = ?, description = ?, listingType = ? WHERE productId = ?";
  db.query(query, [productName, price, category, description, listingType, id], (err, results) => {
    if (err) return res.status(500).json({ message: "עדכון המוצר נכשל" });
    if (results.affectedRows === 0) return res.status(404).json({ message: "המוצר לא נמצא" });
    res.json({ message: "המוצר עודכן בהצלחה" });
  });
});

// מחיקת מוצר, הסרת קובצי התמונות מהשרת ומחיקת דיווחים מקושרים
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT images FROM products WHERE productId = ?", [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: "המוצר לא נמצא" });
    const images = JSON.parse(results[0].images || "[]");

    db.query("DELETE FROM reports WHERE productId = ?", [id], (reportErr) => {
      if (reportErr) console.error("Error deleting related reports:", reportErr);

      db.query("DELETE FROM products WHERE productId = ?", [id], (deleteErr) => {
        if (deleteErr) return res.status(500).json({ message: "מחיקת המוצר נכשלה" });

        images.forEach((imagePath) => {
          const fullPath = path.join(__dirname, "..", imagePath);
          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
            } catch (e) {
              console.error("Error deleting file:", e);
            }
          }
        });

        res.json({ message: "המוצר, התמונות והדיווחים הקשורים נמחקו בהצלחה" });
      });
    });
  });
});

module.exports = router;