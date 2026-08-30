/**
 * מודול: שרת ראשי והגדרות מערכת (Server Entry Point)
 * תפקיד: אתחול שרת Express, חיבור למסד נתוני MySQL, ניתוב נתיבים (Routers) ותקשורת בזמן אמת באמצעות Socket.io
 */

const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql");
const userRouter = require("./Routers/user.js");
const productsRouter = require("./Routers/products.js");
const messagesRouter = require("./Routers/messages.js");
const favoritesRouter = require("./Routers/favorites.js");
const reportRouter = require("./Routers/reports.js");
const session = require("express-session");

const app = express();
const server = http.createServer(app);
const port = 5000;
const FRONTEND_URL = "http://localhost:3000";

// הגדרות מדיניות שיתוף משאבים (CORS)
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// פענוח בקשות בפורמט JSON
app.use(express.json());

// הגדרת ניהול הפעלות משתמש (Session Management)
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// יצירת חיבור למסד הנתונים MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "myproject",
});

// בדיקת תקינות החיבור למסד הנתונים
db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("MySQL connection successful");
  }
});

// אתחול שרת Socket.io לתקשורת צ'אט בזמן אמת
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// הגדרת תיקיית קבצים סטטיים להעלאות תמונות
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// רישום נתיבי ה-API השונים
app.use("/users", userRouter);
app.use("/products", productsRouter);
app.use("/messages", messagesRouter);
app.use("/favorites", favoritesRouter);
app.use("/reports", reportRouter);

// ניהול אירועי התחברות ותקשורת בזמן אמת באמצעות Socket.io
io.on("connection", (socket) => {
  // הצטרפות משתמש לחדר שיחה ייעודי למוצר
  socket.on("join_chat", ({ userId, sellerId, productId }) => {
    const roomId = `chat_${productId}_${Math.min(userId, sellerId)}_${Math.max(userId, sellerId)}`;
    socket.join(roomId);
    console.log(`User ${userId} joined room: ${roomId}`);
  });

  // טיפול בקבלת הודעה, שמירתה במסד הנתונים ושידורה לצד השני
  socket.on("send_message", (data) => {
    const { senderId, receiverId, productId, messageText, messageType } = data;
    const roomId = `chat_${productId}_${Math.min(senderId, receiverId)}_${Math.max(senderId, receiverId)}`;

    // בדיקה במסד האם יש כבר הודעת סגירה למוצר זה
    db.query(
      "SELECT id FROM messages WHERE productId = ? AND messageType = 'closed' LIMIT 1",
      [productId],
      (err, rows) => {
        if (rows && rows.length > 0) {
          console.log(`Blocked: Chat for product ${productId} is closed.`);
          return;
        }

        const sqlInsert =
          "INSERT INTO messages (senderId, receiverId, productId, messageText, messageType, isRead) VALUES (?, ?, ?, ?, ?, 0)";

        db.query(
          sqlInsert,
          [senderId, receiverId, productId, messageText, messageType || "chat"],
          (err, result) => {
            if (err) {
              console.error("Error saving message:", err);
              return;
            }

            const finalMessage = {
              ...data,
              id: result.insertId,
              created_at: new Date().toISOString(),
            };

            // שידור ההודעה לכל המשתמשים בחדר השיחה
            socket.to(roomId).emit("receive_message", finalMessage);
          }
        );
      }
    );
  });

  // טיפול בניתוק משתמש מהשרת
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// הפעלת והאזנת השרת לפורט המוגדר
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});