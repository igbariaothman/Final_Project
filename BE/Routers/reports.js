const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");

const db = dbSingleton.getConnection();
const ADMIN_ID = 14;

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
        message: "כבר דיווחת על מוצר זה",
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
            messageToOwner = `A report has been submitted against your account.\nReport type: User Report\nMessage: ${message}`;
          } else if (reportType === "chat") {
            messageToOwner = `A report has been submitted regarding one of your conversations.\nReport type: Chat Report\nMessage: ${message}`;
          } else if (reportType === "product") {
            messageToOwner = `Your product "${productName}" has been reported.\nReport type: Product Report\nMessage: ${message}`;
          }

          db.query(
            `INSERT INTO messages
              (senderId, receiverId, productId, messageText, messageType)
              VALUES (?, ?, ?, ?, 'chat')`,
            [ADMIN_ID, ownerId, productId, messageToOwner],
            (msgErr) => {
              if (msgErr) {
                console.log("MESSAGE WARNING:", msgErr);
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
      products.productName,
      products.price,
      products.userId AS sellerId,
      seller.username AS sellerName
    FROM reports
    JOIN users ON reports.userId = users.id
    JOIN products ON reports.productId = products.productId
    LEFT JOIN users AS seller ON products.userId = seller.id
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

// Delete report & close chat for both reporter and owner
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM reports WHERE reportId = ?",
    [id],
    (err, reportResult) => {
      if (err) {
        console.log("GET REPORT ERROR:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (reportResult.length === 0) {
        return res.status(404).json({ message: "Report not found" });
      }

      const report = reportResult[0];
      const reporterId = report.userId;
      const productId = report.productId;
      const lockMessage = "התלונה נסגרה על ידי המנהל. הצ'אט ננעל לפניות נוספות.";

      db.query(
        "SELECT userId FROM products WHERE productId = ?",
        [productId],
        (prodErr, prodResult) => {
          const ownerId = (prodResult && prodResult.length > 0) ? prodResult[0].userId : null;

          // 1. עדכון כל ההודעות הקיימות הקשורות למוצר זה ל-closed
          db.query(
            "UPDATE messages SET messageType = 'closed' WHERE productId = ?",
            [productId],
            () => {
              // 2. שליחת הודעת נעילה לבעל המוצר
              if (ownerId) {
                db.query(
                  `INSERT INTO messages (senderId, receiverId, productId, messageText, messageType)
                   VALUES (?, ?, ?, ?, 'closed')`,
                  [ADMIN_ID, ownerId, productId, lockMessage]
                );
              }

              // 3. שליחת הודעת נעילה למדווח
              if (!ownerId || Number(ownerId) !== Number(reporterId)) {
                db.query(
                  `INSERT INTO messages (senderId, receiverId, productId, messageText, messageType)
                   VALUES (?, ?, ?, ?, 'closed')`,
                  [ADMIN_ID, reporterId, productId, lockMessage]
                );
              }

              // 4. מחיקת הדיווח
              db.query("DELETE FROM reports WHERE reportId = ?", [id], (delErr) => {
                if (delErr) {
                  return res.status(500).json({ message: "Failed to delete report" });
                }
                res.json({ message: "Report deleted and chat closed successfully" });
              });
            }
          );
        }
      );
    }
  );
});

// Delete product and report by reportId
router.delete("/with-product/:id", (req, res) => {
  const reportId = req.params.id;
  const { adminMessage } = req.body;

  db.query(
    "SELECT productId, userId FROM reports WHERE reportId = ?",
    [reportId],
    (err, reportResult) => {
      if (err || reportResult.length === 0) {
        return res.status(404).json({ message: "Report not found" });
      }

      const productId = reportResult[0].productId;
      const reporterId = reportResult[0].userId;

      db.query(
        "SELECT userId, productName FROM products WHERE productId = ?",
        [productId],
        (productErr, productResult) => {
          if (productErr || productResult.length === 0) {
            return res.status(404).json({ message: "Product not found" });
          }

          const ownerId = productResult[0].userId;
          const productName = productResult[0].productName;
          const closingMessage = `המוצר "${productName}" הוסר מהמערכת על ידי המנהל. סיבה: ${adminMessage || "ללא פירוט"}. הפנייה נסגרה.`;

          db.query(
            `INSERT INTO messages (senderId, receiverId, productId, messageText, messageType)
             VALUES (?, ?, ?, ?, 'closed')`,
            [ADMIN_ID, ownerId, productId, closingMessage],
            () => {
              db.query(
                `INSERT INTO messages (senderId, receiverId, productId, messageText, messageType)
                 VALUES (?, ?, ?, ?, 'closed')`,
                [ADMIN_ID, reporterId, productId, `הפנייה בנושא המוצר "${productName}" נסגרה. המוצר הוסר מהמערכת.`],
                () => {
                  db.query("DELETE FROM reports WHERE productId = ?", [productId], () => {
                    db.query("DELETE FROM messages WHERE productId = ?", [productId], () => {
                      db.query("DELETE FROM favorites WHERE productId = ?", [productId], () => {
                        db.query("DELETE FROM products WHERE productId = ?", [productId], (finalErr) => {
                          if (finalErr) {
                            return res.status(500).json({ message: "Failed to delete product" });
                          }
                          res.json({
                            message: "Product, report deleted, and chat closed successfully",
                          });
                        });
                      });
                    });
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