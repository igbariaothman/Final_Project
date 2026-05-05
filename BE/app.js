const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql"); 

const userRouter = require("./Routers/user.js");
const productsRouter = require("./Routers/products.js");
const messagesRouter = require("./Routers/messages.js");

const app = express();
const server = http.createServer(app);

const port = 5000; 
const FRONTEND_URL = "http://localhost:3000";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "myproject"
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
  },
});

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/users", userRouter);
app.use("/products", productsRouter);
app.use("/messages", messagesRouter);

io.on("connection", (socket) => {
  socket.on("join_chat", (data) => {
    const { userId, sellerId, productId } = data;
    const roomId = `chat_${productId}_${Math.min(userId, sellerId)}_${Math.max(userId, sellerId)}`;
    socket.join(roomId);
  });

  socket.on("send_message", (data) => {
    const { senderId, receiverId, productId, messageText } = data;
    const roomId = `chat_${productId}_${Math.min(senderId, receiverId)}_${Math.max(senderId, receiverId)}`;

    const sqlInsert = "INSERT INTO messages (senderId, receiverId, productId, messageText, isRead) VALUES (?, ?, ?, ?, 0)";
    
    db.query(sqlInsert, [senderId, receiverId, productId, messageText], (err, result) => {
      if (err) {
        console.error("Error saving message:", err);
        return;
      }

      const finalMessage = {
        ...data,
        id: result.insertId,
        created_at: new Date()
      };

      io.to(roomId).emit("receive_message", finalMessage);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});