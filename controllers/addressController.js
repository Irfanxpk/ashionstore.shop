
const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const fs = require("fs");
const ejs = require("ejs");
require("dotenv").config();
const { Console, log } = require("console");
const razorpay = require("razorpay");
const { key_id, key_secret } = process.env;
const crypto = require("crypto");
const Product = require("../models/Product");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Catagory = require("../models/category");

const addNewAddress = async (req, res) => {
  try {
    // Extract address data from the request body
    const { name, address, city, zip, email, phone, state } = req.body;

    const id = req.session.user_id;
    // Create a new address document
    const newAddress = {
      name,
      address,
      city,
      zip,
      email,
      phone,
      state,
    };

    const emptyField = Object.keys(newAddress).find(
      (key) => newAddress[key] == ""
    );

    if (emptyField) {
      // If any field is empty, respond with an error message
      res.status(400).json({ error: "All fields are required" });
    } else {
      const savedAddress = await User.findOneAndUpdate(
        { _id: id },
        { $set: { _id: id }, $push: { addresses: newAddress } },
        { upsert: true, new: true }
      );
      res.status(201).json(savedAddress);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding a new address." });
  }
};




//=============================edit Address =============================
const editAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const id = req.params.id;
    const userData = await User.findOne(
      { _id: userId },
      { addresses: { $elemMatch: { _id: id } } }
    );
    console.log(userData);
    if (userData) {
      res.json(userData);
    } else {
      res.send("Hello");
    }
  } catch (e) {
    console.log("Error" + e);
  }
};



//=====================UPDATE tHE ADDRESS =============================
const updateAddress = async (req, res) => {
  try {
    const id = req.body.id;
    const userId = req.session.user_id;
    const { name, address, city, zip, email, phone, state } = req.body;
    console.log(id, userId);

    const updatedAddressData = {
      name,
      address,
      city,
      zip,
      email,
      phone,
      state,
    };

    const data = await User.updateOne(
      { _id: userId, "addresses._id": id },
      { $set: { "addresses.$": updatedAddressData } }
    );

    console.log(data);
    if (data) {
      res.status(201).json(data);
    } else {
      res.status(404).json();
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

//==================================deleteAddress====================================
const deleteAddress = async (req, res) => {
  try {
    console.log("its time to delete address");

    const userId = req.session.user_id;
    const addressId = req.params.id;
    const deletionResult = await User.updateOne(
      { _id: userId },
      { $pull: { addresses: { _id: addressId } } }
    );
    if (deletionResult.nModified > 0) {
      // If at least one document is modified (address is deleted)
      res.status(200).json({ message: "Address deleted successfully" });
    } else {
      res.status(404).json({ error: "Address not found or already deleted" });
    }
  } catch (e) {
    console.log("Error: " + e);
    res.status(500).json({ error: "Internal server error" });
  }
};



module.exports = {
  editAddress,
  addNewAddress,
  updateAddress,
  deleteAddress,
};