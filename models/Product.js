// models/product.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active",
  },
  category: {
    type: mongoose.Schema.Types.ObjectId
  },
  images: Array, // Store image URLs
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
