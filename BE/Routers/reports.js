const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");

const db = dbSingleton.getConnection();


//Send a report about a product
router.post("/", (req, res) => {
  const { productId, userId, reportType, message } = req.body;

  const sql = `
    INSERT INTO reports
    (productId, userId, reportType, message)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [productId, userId, reportType, message], (err, result) => {
    if (err) {
      console.log("❌ REPORT ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json({ message: "Report sent successfully" });
  });
});


// get all reports for admin review
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      reports.*,
      users.username,
      products.*

    FROM reports

    JOIN users
      ON reports.userId = users.id

    JOIN products
      ON reports.productId = products.productId

    ORDER BY reports.createdAt DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("REPORT ERROR:", err);
      return res.status(500).json({ message: err.message });
    }

    res.json(result);
  });
});


module.exports = router;
