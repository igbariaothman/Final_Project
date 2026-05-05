const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");
const { body, validationResult } = require('express-validator');

const db = dbSingleton.getConnection();

const messageValidation = [
  body("senderId").isInt().withMessage("Invalid Sender ID"),
  body("receiverId").isInt().withMessage("Invalid Receiver ID"),
  body("productId").isInt().withMessage("Invalid Product ID"),
  body("messageText").trim().notEmpty().withMessage("Message cannot be empty")
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
  }
  next();
};

router.post("/send", messageValidation, validate, (req, res) => {
  const { senderId, receiverId, productId, messageText } = req.body;
  const query = "INSERT INTO messages (senderId, receiverId, productId, messageText) VALUES (?, ?, ?, ?)";

  db.query(query, [senderId, receiverId, productId, messageText], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(201).json({ message: "Message sent", messageId: results.insertId });
  });
});

router.get("/history/:productId/:user1/:user2", (req, res) => {
  const { productId, user1, user2 } = req.params;
  const query = `
    SELECT * FROM messages 
    WHERE productId = ? 
    AND ((senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?))
    ORDER BY created_at ASC`;

  db.query(query, [productId, user1, user2, user2, user1], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching history" });
    res.json(results);
  });
});

router.get("/inbox/:userId", (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT m.*, u.username AS contactName, p.productName 
    FROM messages m
    JOIN users u ON (u.id = IF(m.senderId = ?, m.receiverId, m.senderId))
    JOIN products p ON m.productId = p.productId
    WHERE (m.senderId = ? OR m.receiverId = ?)
    AND m.id IN (
        SELECT MAX(id) FROM messages GROUP BY productId, LEAST(senderId, receiverId), GREATEST(senderId, receiverId)
    )
    ORDER BY m.created_at DESC`;

  db.query(query, [userId, userId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching inbox" });
    res.json(results);
  });
});

router.put("/read/:productId/:senderId/:receiverId", (req, res) => {
  const { productId, senderId, receiverId } = req.params;
  const query = "UPDATE messages SET isRead = 1 WHERE productId = ? AND senderId = ? AND receiverId = ?";

  db.query(query, [productId, senderId, receiverId], (err) => {
    if (err) return res.status(500).json({ message: "Error updating status" });
    res.json({ message: "Messages marked as read" });
  });
});

module.exports = router;