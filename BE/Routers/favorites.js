const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");

// Execute a query to the database
const db = dbSingleton.getConnection();

//show all favorites
router.get("/", (req, res) => {
  const { userId } = req.query;

  const query = `
    SELECT p.*
    FROM favorites f
    JOIN products p ON f.productId = p.id
    WHERE f.userId = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

//add favorit
router.post("/addfavorite", (req, res) => {
  const {userId , productId } = req.body;
  const query = "INSERT INTO favorites (userId , productId ) VALUES (? ,?)";
  db.query(query, [userId, productId], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: "Product added to favorites!", id: results.insertId });
  });
});

//delete favorite
router.delete("/:productId", (req, res) => {
  const { productId } = req.params;
  const { userId } = req.body;
  const query = "DELETE FROM favorites WHERE userId = ? AND productId = ?";
  db.query(query, [userId, productId], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ message: "Favorite not found" });
    } else {
      res.json({ message: "Product removed from favorites!" });
    }
  });
});


module.exports = router;

