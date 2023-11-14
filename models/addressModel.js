const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addresses: [
    {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      zip: {
        type: String,
        required: true,
      },
      phone: String,
      email: {
        type: String,
        required: true,
      },
      state : { 
        type:String,
        required : true,
      }
    },
  ],
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
