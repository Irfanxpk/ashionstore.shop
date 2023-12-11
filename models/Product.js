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
    type: mongoose.Schema.Types.ObjectId ,
    ref : 'Category'
  },
  images: Array, // Store image URLs

  offers: [{
    offerType: {
      type: String,
      enum: ["product", "category"], // Offer types
    },

    discountValue: Number,
    validFrom: Date,
    validUntil: Date,
  }]
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
