// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Models
const User = require("./models/User");
const Product = require("./models/Product");

const app = express();

// ================= MIDDLEWARES =================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ================= DATABASE CONNECT =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB error ❌", err));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Collex backend running 🚀");
});

// ================= USER APIs =================

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.json({ message: "Registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Register failed" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// ================= PRODUCT APIs =================

// ADD PRODUCT
app.post("/add-product", async (req, res) => {
  try {
    const { title, price, type, description, sellerEmail, image } = req.body;

    const product = new Product({
      title,
      price,
      type,
      description,
      sellerEmail,
      image
    });

    await product.save();
    res.json({ message: "Product added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Add product failed" });
  }
});

// GET PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.json([]);
  }
});

// DELETE PRODUCT (OWNER ONLY)
app.delete("/delete-product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const userEmail = req.query.email;
    if (product.sellerEmail !== userEmail) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
