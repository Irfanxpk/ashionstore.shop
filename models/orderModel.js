const mongoose = require("mongoose");

const orderdetails = mongoose.Schema({
  user_Id: {
    type: String,
    required: true,
  },
  addresses: [
    {
      location: {
        type: String,
      },
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      zip: {
        type: String,
      },
      phone: String,
      email: {
        type: String,
      },
      state: {
        type: String,
      },
    },
  ],
  items: [
    {
      productid: {
        type: String,
        ref: "product",
      },
      name: {
        type: String,
        required : true
      },
      img:{
        type : String,
        required : true
      },
      count: {
        type: Number,
        default: 1,
      },
      total: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        default: "Pending",
      },
    },
  ],
  purchaseDate: {
    type: Date,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
  },
  shippingMethod: {
    type: String,
    required: true,
  },
  shippingFee: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("order", orderdetails);
