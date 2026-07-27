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

// delete product and report by productId (admin only) - also deletes all related reports
router.delete("/with-product/:id", (req, res) => {
  const reportId = req.params.id;
  const { adminId, adminMessage } = req.body;

  // 1) Get product id from report
  db.query(
    "SELECT productId FROM reports WHERE reportId = ?",
    [reportId],
    (err, reportResult) => {
      if (err || reportResult.length === 0) {
        return res.status(404).json({
          message: "Report not found",
        });
      }

      const productId = reportResult[0].productId;

      // 2) Get product owner
      db.query(
        "SELECT userId, productName FROM products WHERE productId = ?",
        [productId],
        (err, productResult) => {
          if (err || productResult.length === 0) {
            return res.status(404).json({
              message: "Product not found",
            });
          }

          const ownerId = productResult[0].userId;
          const productName = productResult[0].productName;

          // 3) Send message to product owner
          const message = `Your product "${productName}" was removed by an administrator.

          Admin message:
          ${adminMessage}`;
          db.query(
            `INSERT INTO messages
            (senderId, receiverId, productId, messageText, messageType)
            VALUES (?, ?, ?, ?, ?)`,
            [adminId, ownerId, productId, message, "notification"],
            (err, result) => {
              if (err) {
                console.log("MESSAGE ERROR:", err);
                return res.status(500).json({
                  message: "Failed to send message",
                });
              }

              console.log("MESSAGE INSERTED:", result);

              db.query(
                "SELECT * FROM messages ORDER BY id DESC LIMIT 1",
                (err, rows) => {
                  console.log("LAST MESSAGE:", rows);
                },
              );
              // delete product...

              // 4) Delete product
              db.query("DELETE FROM products WHERE productId = ?", [productId]);

              // 5) Delete report
              db.query("DELETE FROM reports WHERE reportId = ?", [reportId]);

              res.json({
                message: "Product, report deleted and user notified",
              });
            },
          );
        },
      );
    },
  );
});

module.exports = router;
