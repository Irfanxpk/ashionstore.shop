const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  password: {
    type: Number,
    required:true
  },
});

module.exports = mongoose.model("admin", adminSchema);