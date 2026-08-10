const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");

const db = dbSingleton.getConnection();

// Send a report about a product
router.post("/", (req, res) => {
  const { productId, userId, reportType, message } = req.body;

  const checkSql = `
    SELECT * FROM reports
    WHERE productId = ? AND userId = ?
  `;

  db.query(checkSql, [productId, userId], (err, reports) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (reports.length > 0) {
      return res.status(400).json({
        message: "You already reported this product",
      });
    }

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

        if (Number(ownerId) === Number(userId)) {
          return res.status(400).json({
            message: "You cannot report your own product",
          });
        }

        const sql = `
          INSERT INTO reports
          (productId, userId, reportType, message)
          VALUES (?, ?, ?, ?)
        `;

        db.query(sql, [productId, userId, reportType, message], (err) => {
          if (err) {
            console.log("REPORT ERROR:", err);
            return res.status(500).json({
              message: "Server error",
            });
          }

          let messageToOwner = "";

          if (reportType === "user") {
            messageToOwner = `A report has been submitted against your account.
Report type: User Report
Message: ${message}`;
          } else if (reportType === "chat") {
            messageToOwner = `A report has been submitted regarding one of your conversations.
Report type: Chat Report
Message: ${message}`;
          } else if (reportType === "product") {
            messageToOwner = `Your product "${productName}" has been reported.
Report type: Product Report
Message: ${message}`;
          }

          const senderId = 14;
          db.query(
            `INSERT INTO messages
              (senderId, receiverId, productId, messageText, messageType)
              VALUES (?, ?, ?, ?, ?)`,
            [senderId, ownerId, productId, messageToOwner, "notification"],
            (err) => {
              if (err) {
                console.log("MESSAGE ERROR:", err);
                return res.status(500).json({
                  message: "Failed to send notification",
                });
              }

              res.json({
                message: "Report sent successfully",
              });
            }
          );
        });
      }
    );
  });
});

// Get all reports for admin review
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

// Delete a report by reportId (admin only) -> מחיקת תלונה ונעילת צ'אט
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM reports WHERE reportId = ?", [id], (err, reportResult) => {
    if (err || reportResult.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    const report = reportResult[0];
    const adminId = 14;
    const lockMessage = "התלונה נסגרה על ידי המנהל. הצ'אט ננעל לפניות נוספות.";

    db.query(
      `INSERT INTO messages (senderId, receiverId, productId, messageText, messageType)
       VALUES (?, ?, ?, ?, 'closed')`,
      [adminId, report.userId, report.productId, lockMessage],
      () => {
        db.query("DELETE FROM reports WHERE reportId = ?", [id], (err) => {
          if (err) return res.status(500).json({ message: "Server error" });
          res.json({ message: "Report deleted successfully" });
        });
      }
    );
  });
});


// delete product and report by productId (admin only)
router.delete("/with-product/:id", (req, res) => {
  const reportId = req.params.id;
  const { adminId, adminMessage } = req.body;

  // 1) Get product id and reporter id from report
  db.query(
    "SELECT productId, userId FROM reports WHERE reportId = ?",
    [reportId],
    (err, reportResult) => {
      if (err || reportResult.length === 0) {
        return res.status(404).json({ message: "Report not found" });
      }

      const productId = reportResult[0].productId;
      const reporterId = reportResult[0].userId;

      // 2) Get product owner
      db.query(
        "SELECT userId, productName FROM products WHERE productId = ?",
        [productId],
        (err, productResult) => {
          if (err || productResult.length === 0) {
            return res.status(404).json({ message: "Product not found" });
          }

          const ownerId = productResult[0].userId;
          const productName = productResult[0].productName;

          const closingMessage = `המוצר "${productName}" הוסר מהמערכת על ידי המנהל. סיבה: ${adminMessage || "ללא פירוט"}. הפנייה נסגרה.`;

          // 3) שליחת הודעת סגירה ונעילה לבעל המוצר
          db.query(
            `INSERT INTO messages
            (senderId, receiverId, productId, messageText, messageType)
            VALUES (?, ?, ?, ?, ?)`,
            [adminId || 14, ownerId, productId, closingMessage, "closed"],
            (err) => {
              if (err) console.log("MESSAGE ERROR OWNER:", err);

              // 4) שליחת הודעת סגירה ונעילה למדווח
              db.query(
                `INSERT INTO messages
                (senderId, receiverId, productId, messageText, messageType)
                VALUES (?, ?, ?, ?, ?)`,
                [adminId || 14, reporterId, productId, `הפנייה בנושא המוצר "${productName}" נסגרה. המוצר הוסר מהמערכת.`, "closed"],
                (err) => {
                  if (err) console.log("MESSAGE ERROR REPORTER:", err);

                  // 5) מחיקת המוצר והדיווח
                  db.query("DELETE FROM products WHERE productId = ?", [productId]);
                  db.query("DELETE FROM reports WHERE reportId = ?", [reportId]);

                  res.json({
                    message: "Product, report deleted, and chat closed successfully",
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});
module.exports = router;