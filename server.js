// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Models
const User = require("./models/User");
const Product = require("./models/Product");

const app = express();

// Middlewares
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
    console.log("REGISTER REQUEST BODY:", req.body);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ message: "User already exists" });
    }

    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    console.log("USER SAVED:", user);
    res.json({ message: "Registered successfully" });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Register failed" });
  }
});


// LOGIN

app.post("/login", async (req, res) => {
  try {
    console.log("LOGIN REQUEST:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found");
      return res.json({ message: "Invalid credentials" });
    }

    if (user.password !== password) {
      console.log("❌ Password mismatch");
      return res.json({ message: "Invalid credentials" });
    }

    console.log("✅ Login success");
    res.json({ message: "Login successful" });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});



// ================= PRODUCT APIs =================

// ADD PRODUCT (SELL / RENT)
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

// DELETE PRODUCT
app.delete("/delete-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    await Product.findByIdAndDelete(productId);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete failed" });
  }
});


// GET ALL PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.json([]);
  }
});

// DELETE PRODUCT
app.delete("/delete-product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Logged user email from query
    const userEmail = req.query.email;

    if (product.sellerEmail !== userEmail) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});



// ================= SERVER START =================
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});


