const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");

// Execute a query to the database
const db = dbSingleton.getConnection();

router.get("/", (req, res) => {
  const query = "SELECT * FROM products";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

// images 
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

//Add Product
router.post("/addProduct", upload.array("images", 5), (req, res) => {
  const { productName, price, category, description, userId } = req.body;

  const images = req.files.map((file) => `/uploads/${file.filename}`);

  const query =
    "INSERT INTO products (productName, price, category, description, userId, images) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [productName, price, category, description, userId, JSON.stringify(images)],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.json({
        message: "Product added!",
        id: results.insertId,
        images,
      });
    },
  );
});


//Update Product
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { productName, price, category } = req.body;
  const query =
    "UPDATE products SET productName = ?, price = ? , category = ? WHERE productId = ?";
  db.query(query, [productName, price, category , id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: "Product updated!" });
  });
});

//Delete Product
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM products WHERE productId = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: "Product deleted!" });
  });
});

module.exports = router;
