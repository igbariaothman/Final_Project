//עותמאן אגבאריה 327809190
//214626913 אחמד חבשי

const path = require("path");
const userRiuter = require("./Routers/user.js");
const productsRiuter = require("./Routers/products.js");
const favoritesRouter = require("./Routers/favorites.js");

const express = require("express");

const app = express();
const port = 5000;

const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/users", userRiuter);
app.use("/products", productsRiuter);
app.use("/favorite", favoritesRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
