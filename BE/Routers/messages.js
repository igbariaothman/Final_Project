/**
 * מודול: נתיבי שרת לניהול הודעות ושיחות (Messages Routes)
 * תפקיד: שליפת היסטוריית שיחות, ניהול תיבת דואר נכנס (Inbox) ועדכון סטטוס קריאת הודעות
 */

const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");
const { param, body, validationResult } = require("express-validator");

const db = dbSingleton.getConnection();

// פונקציית תיווך לאימות תקינות נתוני הבקשה
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map((err) => err.msg) });
  }
  next();
};

// הגדרת בדיקות תקינות לפרמטרי היסטוריית צ'אט
const chatParamsValidation = [
  param("productId").isInt().withMessage("מזהה מוצר לא תקין"),
  param("user1").isInt().withMessage("מזהה משתמש 1 לא תקין"),
  param("user2").isInt().withMessage("מזהה משתמש 2 לא תקין"),
];

// שליפת היסטוריית הודעות בין שני משתמשים עבור מוצר ועדכון אוטומטי של הודעות שנקראו
router.get("/history/:productId/:user1/:user2", chatParamsValidation, validate, (req, res) => {
  const { productId, user1, user2 } = req.params;

  const query = `
    SELECT * FROM messages 
    WHERE productId = ? 
    AND ((senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?))
    ORDER BY created_at ASC
  `;

  db.query(query, [productId, user1, user2, user2, user1], (err, results) => {
    if (err) return res.status(500).json({ message: "שגיאה בטעינת היסטוריית ההודעות" });

    // סימון הודעות כנקראו (שנשלחו אל המשתמש הפותח)
    const updateReadQuery = `
      UPDATE messages 
      SET isRead = 1 
      WHERE productId = ? 
      AND ((senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?))
      AND isRead = 0
    `;

    db.query(updateReadQuery, [productId, user2, user1, user1, user2], (updateErr) => {
      if (updateErr) console.error("Error auto-updating read status:", updateErr);
    });

    res.json(results);
  });
});

// שליפת כל השיחות הפעילות של המשתמש עבור תיבת הדואר הנכנס כולל ספירת הודעות שלא נקראו
router.get("/inbox/:userId", [param("userId").isInt().withMessage("מזהה משתמש לא תקין")], validate, (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT
        m.*,
        u.username AS contactName,
        u.role AS contactRole,
        COALESCE(p.productName, 'הודעת מערכת / כללי') AS productName,
        (
          SELECT COUNT(*)
          FROM messages unread_m
          WHERE unread_m.productId = m.productId
            AND unread_m.receiverId = ?
            AND unread_m.senderId = IF(m.senderId = ?, m.receiverId, m.senderId)
            AND unread_m.isRead = 0
        ) AS unreadCount
      FROM messages m
      JOIN users u
        ON u.id = IF(m.senderId = ?, m.receiverId, m.senderId)
      LEFT JOIN products p
        ON m.productId = p.productId
      WHERE (m.senderId = ? OR m.receiverId = ?)
        AND m.id IN (
          SELECT MAX(id)
          FROM messages
          GROUP BY productId, LEAST(senderId, receiverId), GREATEST(senderId, receiverId)
        )
      ORDER BY m.created_at DESC
  `;

  db.query(query, [userId, userId, userId, userId, userId], (err, results) => {
    if (err) {
      console.error("Inbox DB Error:", err);
      return res.status(500).json({ message: "שגיאה בטעינת תיבת הדואר הנכנס" });
    }
    res.json(results);
  });
});

// עדכון סטטוס הודעות כנקראו באמצעות גוף הבקשה (JSON Body)
router.put(
  "/mark-read",
  [
    body("productId").isInt().withMessage("מזהה מוצר לא תקין"),
    body("userId").isInt().withMessage("מזהה משתמש לא תקין"),
    body("contactId").isInt().withMessage("מזהה איש קשר לא תקין"),
  ],
  validate,
  (req, res) => {
    const { productId, userId, contactId } = req.body;
    const query = `
      UPDATE messages 
      SET isRead = 1 
      WHERE productId = ? AND receiverId = ? AND senderId = ?
    `;

    db.query(query, [productId, userId, contactId], (err) => {
      if (err) return res.status(500).json({ message: "עדכון מצב ההודעות נכשל" });
      res.json({ success: true, message: "ההודעות סומנו כנקראו" });
    });
  }
);

// עדכון סטטוס הודעות כנקראו באמצעות פרמטרים בנתיב (URL Params)
router.put("/read/:productId/:senderId/:receiverId", (req, res) => {
  const { productId, senderId, receiverId } = req.params;
  const query = `
    UPDATE messages 
    SET isRead = 1 
    WHERE productId = ? AND senderId = ? AND receiverId = ?
  `;

  db.query(query, [productId, senderId, receiverId], (err) => {
    if (err) return res.status(500).json({ message: "שגיאה בעדכון סטטוס ההודעות" });
    res.json({ success: true, message: "ההודעות סומנו כנקראו" });
  });
});

module.exports = router;