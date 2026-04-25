const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const userRouter = require("./Routers/user.js");
const productsRouter = require("./Routers/products.js");
const messagesRouter = require("./Routers/messages.js");

const app = express();
const server = http.createServer(app);

const port = 5000; 

const FRONTEND_URL = "http://localhost:3000";


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
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    const roomName = `product_${data.productId}_chat_${data.roomSuffix}`;
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);
  });

  socket.on("send_message", (data) => {
    const roomName = `product_${data.productId}_chat_${data.roomSuffix}`;
    socket.to(roomName).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});