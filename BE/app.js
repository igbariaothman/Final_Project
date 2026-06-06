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

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "myproject",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("MySQL connection successful");
  }
});

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/users", userRouter);
app.use("/products", productsRouter);
app.use("/messages", messagesRouter);
app.use("/favorites", favoritesRouter);
app.use("/reports", reportRouter);

io.on("connection", (socket) => {
  socket.on("join_chat", ({ userId, sellerId, productId }) => {
    const roomId = `chat_${productId}_${Math.min(userId, sellerId)}_${Math.max(userId, sellerId)}`;
    socket.join(roomId);
    console.log(`User ${userId} joined room: ${roomId}`);
  });

  socket.on("send_message", (data) => {
    const { senderId, receiverId, productId, messageText } = data;
    const roomId = `chat_${productId}_${Math.min(senderId, receiverId)}_${Math.max(senderId, receiverId)}`;

    const sqlInsert =
      "INSERT INTO messages (senderId, receiverId, productId, messageText, isRead) VALUES (?, ?, ?, ?, 0)";

    db.query(
      sqlInsert,
      [senderId, receiverId, productId, messageText],
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

        socket.to(roomId).emit("receive_message", finalMessage);
        console.log(`Message sent in room: ${roomId}`);
      }
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});