const express = require("express");
const router = express.Router();
const dbSingleton = require("../db/dbSingleton");
const { body, validationResult } = require('express-validator');
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Get the DB connection pool
const db = dbSingleton.getConnection();

// --- 1. Multer Configuration for Image Uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// --- 2. Validation Rules ---
const productValidation = [
  body("productName").trim().notEmpty().withMessage("Product name is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("userId").isInt().withMessage("Valid User ID is required"),
  body("listingType").isIn(['sale', 'donation']).withMessage("Listing type must be 'sale' or 'donation'"),
  body("productstatus").isIn(['new', 'like-new', 'good', 'fair']).withMessage("Product status must be one of: new, like-new, good, fair")
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
  }
  next();
};

// --- 3. Routes ---

// Get all products
router.get("/", (req, res) => {
  const query = `
    SELECT p.*, u.username 
    FROM products p 
    JOIN users u ON p.userId = u.id 
    ORDER BY p.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching data" });
    
    const formattedResults = results.map(product => ({
      ...product,
      images: JSON.parse(product.images || "[]")
    }));
    res.json(formattedResults);
  });
});

// Get one product 
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT p.*, u.username 
    FROM products p 
    JOIN users u ON p.userId = u.id 
    WHERE p.productId = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching product" });
    if (results.length === 0) return res.status(404).json({ message: "Product not found" });

    const product = {
      ...results[0],
      images: JSON.parse(results[0].images || "[]"),
    };
    res.json(product);
  });
});

// Add a new product with image upload
router.post("/addProduct", upload.array("images", 10), productValidation, validate, (req, res) => {
  const { productName, price, category, description, userId, listingType, productstatus } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "At least one image is required" });
  }

  const imagesPaths = req.files.map((file) => `/uploads/${file.filename}`);
  const query = `
    INSERT INTO products 
    (productName, price, category, description, userId, images, listingType, productstatus) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [productName, price, category, description, userId, JSON.stringify(imagesPaths), listingType, productstatus],
    (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ message: "Database error during product insertion" });
      }
      res.status(201).json({
        message: "Product added successfully",
        productId: results.insertId,
        images: imagesPaths
      });
    }
  );
});

// Update product details
router.put("/:id", productValidation, validate, (req, res) => {
  const { id } = req.params;
  const { productName, price, category, description, listingType } = req.body;

  const query = "UPDATE products SET productName = ?, price = ?, category = ?, description = ?, listingType = ? WHERE productId = ?";
  db.query(query, [productName, price, category, description, listingType, id], (err, results) => {
    if (err) return res.status(500).json({ message: "Update failed" });
    if (results.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated successfully" });
  });
});

// Delete a product and its associated images
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT images FROM products WHERE productId = ?", [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: "Product not found" });
    const images = JSON.parse(results[0].images || "[]");
    
    db.query("DELETE FROM products WHERE productId = ?", [id], (deleteErr) => {
      if (deleteErr) return res.status(500).json({ message: "Delete failed" });
      
      images.forEach(imagePath => {
        const fullPath = path.join(__dirname, "..", imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
      res.json({ message: "Product and associated images deleted successfully" });
    });
  });
});

// Mark as sold and update status field to match React code 
router.put("/sold/:id", (req, res) => {
  const { id } = req.params;
  const query = "UPDATE products SET status = 'sold' WHERE productId = ?";
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to mark as sold" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product marked as sold successfully" });
  });
});

module.exports = router;