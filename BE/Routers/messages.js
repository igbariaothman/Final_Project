const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");
const { param, validationResult } = require("express-validator");

const db = dbSingleton.getConnection();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map((err) => err.msg) });
  }
  next();
};

const chatParamsValidation = [
  param("productId").isInt().withMessage("מזהה מוצר לא תקין"),
  param("user1").isInt().withMessage("מזהה משתמש 1 לא תקין"),
  param("user2").isInt().withMessage("מזהה משתמש 2 לא תקין"),
];

// History with automatic mark-as-read integration
router.get("/history/:productId/:user1/:user2", chatParamsValidation, validate, (req, res) => {
  const { productId, user1, user2 } = req.params;
  
  const query = `
    SELECT * FROM messages 
    WHERE productId = ? 
    AND ((senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?))
    ORDER BY created_at ASC`;

  db.query(query, [productId, user1, user2, user2, user1], (err, results) => {
    if (err) return res.status(500).json({ message: "שגיאה בטעינת היסטוריית ההודעות" });
    
    const updateReadQuery = `
      UPDATE messages SET isRead = 1 
      WHERE productId = ? AND senderId = ? AND receiverId = ? AND isRead = 0`;
    
    db.query(updateReadQuery, [productId, user2, user1], (updateErr) => {
      if (updateErr) console.error("Error auto-updating read status:", updateErr);
    });

    res.json(results);
  });
});

// Inbox - Enhanced query to handle regular chats, system messages, and Admin notifications cleanly
router.get("/inbox/:userId", [param("userId").isInt().withMessage("מזהה משתמש לא תקין")], validate, (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT
        m.*,
        u.username AS contactName,
        u.role AS contactRole,
        COALESCE(p.productName, 'הודעת מערכת / כללי') AS productName
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
      ORDER BY m.created_at DESC`;

  db.query(query, [userId, userId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: "שגיאה בטעינת תיבת הדואר הנכנס" });
    res.json(results);
  });
});

// Mark as read explicitly
router.put("/read/:productId/:senderId/:receiverId", (req, res) => {
  const { productId, senderId, receiverId } = req.params;
  const query =
    "UPDATE messages SET isRead = 1 WHERE productId = ? AND senderId = ? AND receiverId = ?";

  db.query(query, [productId, senderId, receiverId], (err) => {
    if (err) return res.status(500).json({ message: "שגיאה בעדכון סטטוס ההודעות" });
    res.json({ message: "ההודעות סומנו כנקראו" });
  });
});

module.exports = router;