const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String, // You can specify a format or validation here
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email addresses are unique
  },
  gender: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // Automatically set to the current date when a new user is created
  },
  verified: {
    type: Boolean,
    default: false, // Initially, the user is not verified
  },
  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active", // Set the default status to "active"
  },
  refferralCode: {
    type: String,
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

  tempaddress: [
    {
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
});

const User = mongoose.model("User", userSchema);

module.exports = User;
