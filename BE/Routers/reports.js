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
      console.log("REPORT ERROR:", err);
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

// delete a report by reportId (admin only)
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM reports WHERE reportId = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("DELETE REPORT ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report deleted successfully" });
  });
});

// delete product and report by productD (admin only) - also deletes all related reports
// router.delete("/with-product/:id", (req, res) => {
//   const reportId = req.params.id;

//   db.query(
//     "SELECT productId FROM reports WHERE productId = ?",
//     [reportId],
//     (err, result) => {
//       if (err || result.length === 0) {
//         return res.status(404).json({ message: "Report not found" });
//       }

//       const productId = result[0].productId;

//       // delete product
//       db.query("DELETE FROM products WHERE productId = ?", [productId]);

//       // delete report
//       db.query("DELETE FROM reports WHERE productId = ?", [reportId]);

//       res.json({ message: "Product + Report deleted" });
//     },
//   );
// });

router.delete("/with-product/:id", (req, res) => {
  const reportId = req.params.id;

  db.query(
    "SELECT productId FROM reports WHERE reportId = ?",
    [reportId],
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(404).json({ message: "Report not found" });
      }

      const productId = result[0].productId;

      // delete product
      db.query("DELETE FROM products WHERE productId = ?", [productId]);

      // delete report
      db.query("DELETE FROM reports WHERE reportId = ?", [reportId]);

      res.json({ message: "Product + Report deleted" });
    },
  );
});

module.exports = router;
