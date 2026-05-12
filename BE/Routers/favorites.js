const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");

const db = dbSingleton.getConnection();

router.get("/", (req, res) => {
  const { userId } = req.query;
  const query = `
    SELECT p.*, p.productId as productId
    FROM favorites f
    JOIN products p ON f.productId = p.productId
    WHERE f.userId = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/add", (req, res) => {
  const { userId, productId } = req.body;
  const query = "INSERT INTO favorites (userId, productId) VALUES (?, ?)";
  db.query(query, [userId, productId], (err, results) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "המוצר כבר קיים במועדפים" });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Product added to favorites!", id: results.insertId });
  });
});

router.delete("/remove/:productId", (req, res) => {
  const { productId } = req.params;
  const { userId } = req.body;
  const query = "DELETE FROM favorites WHERE userId = ? AND productId = ?";
  db.query(query, [userId, productId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product removed from favorites!" });
  });
});

router.get("/check", (req, res) => {
  const { userId, productId } = req.query;
  const query = "SELECT * FROM favorites WHERE userId = ? AND productId = ?";
  db.query(query, [userId, productId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json({ isFavorite: results.length > 0 });
  });
});

module.exports = router;