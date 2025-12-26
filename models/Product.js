const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  type: String,
  description: String,
  sellerEmail: String,

  phone: String,   // ✅ NEW FIELD
  image: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Product", productSchema);
