const mongoose = require("mongoose");

const cartdata = mongoose.Schema({
  userid: {
    type: String,
    required: true,
    ref: "user",
  },
  items: [
    {
      name:{
        type : String,
        required: true,
      },
      productid: {
        type: String,
        required: true,
        ref: "Product",
      },
      count: {
        type: Number,
        default: 1,
      },
      total: {
        type: Number,
        default: 0,
      },
      img : {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("cart", cartdata);
