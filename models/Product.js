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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  images: Array, // Store image URLs

  // offers: [{
  //   offerType: {
  //     type: String,
  //     enum: ["product", "category"], // Offer types
  //   },

  //   discount: Number,
  //   validFrom: Date,
  //   validUntil: Date,
  // }],

  // Product Offer Fields
  productOffer: {
    discount: {
      type: Number,
      default: 0,
    },
    validFrom: String,
    validUntil: String,
  },

  // Category Offer Fields
  categoryOffer: {
    discount: {
      type: Number,
      default: 0,
    },
    validFrom: String,
    validUntil: String,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
