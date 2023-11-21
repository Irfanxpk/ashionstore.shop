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
const Razorpay = new razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

let otp;
let email2;

//============================genarating otp=========================================
function generateOtp() {
  const otpExpirationTime = 2 * 60 * 1000;
  otp = Math.floor(100000 + Math.random() * 900000);
  setTimeout(() => {
    otp = null; // OTP is no longer valid
  }, otpExpirationTime);
}
//=============================password comparing====================================

const compare = async (loginPassword, hashedPassword) => {
  try {
    const result = await bcrypt.compare(loginPassword, hashedPassword);
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};

//===========================OTP VERIFICATION====================================

let nameResend;
//====send otp
// let otp ; // decalring otp variable globaly to access
// function otpgenerator() {
//     otp = Math.floor(100000 + Math.random() * 900000);

// }

const sendVerifyMail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "pkirfanx@gmail.com",
        pass: "eyxj jcyr ytpy rmmp",
      },
    });

    const emailTemplate = await fs.promises.readFile(
      "views/user/emailSend.ejs",
      "utf8"
    );

    const html4mailoption = ejs.render(emailTemplate, { otpsend: otp });
    const mailoptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Ashion.com Verification",
      html: html4mailoption,
    };

    const info = await transporter.sendMail(mailoptions);
    console.log("Email has been sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

//==========================PASSWORD ENCRYPYING=======================================

const securePassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    // Handle the error by either throwing it or returning a rejected Promise
    console.error(error.message);
    throw error; // This throws the error so that it can be caught by the calling code
  }
};

//===========================LODING LANDING PAGE=========================================
const home = async (req, res) => {
  const isLoggedIn = false;
  const products = await Product.findMany({ status: "active" });

  res.render("index", { isLoggedIn, products });
};

//sample user info

const userinfo = async (req, res) => {
  const userData = await User.findOne({ _id: req.session.user_id });
  // const addresses = await Address.find({ user: userData._id });
  const orders = await Order.find({ user_Id: userData._id });
  console.log(orders);
  // console.log(addresses);
  await orders.sort(
    (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
  );
  const isLoggedIn = (await req.session.user_id) ? true : false;
  // res.render('userProfile',{userData ,addresses , isLoggedIn:true})
  res.render("userProfile", { isLoggedIn, userData, orders });
};

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;
  console.log(updatedData);
  console.log(userId);

  const user = await User.findByIdAndUpdate(userId, updatedData, {
    upsert: true,
  });

  if (!user) {
    res.json({ error: "User not found" });
  } else {
    const response = {
      message: "Form data received and processed successfully",
    };
    res.json(response);
  }
};

//====================Add New Address =================
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

//==========================loding login page============================================
const login = async (req, res) => {
  if (req.session.name) {
    const isLoggedIn = true;
    const products = await Product.find();
    res.render("index", { isLoggedIn, products });
  } else {
    res.render("login");
  }
};

//===========================User Authentication===================================
const loginvalid = async (req, res) => {
  try {
    console.log(process.env.EMAIL);
    const logemail = await User.findOne({ email: req.body.email });
    const loginPassword = req.body.Password;
    if (logemail) {
      const logpass = await bcrypt.compare(loginPassword, logemail.password);
      if (logemail && logpass) {
        console.log("sdgjfhds");
        if (logemail.status == "active") {
          if (logemail.verified == true) {
            req.session.name = logemail.firstName;
            req.session.user_id = logemail._id;
            const isLoggedIn = true;
            const products = await Product.find();
            res.render("index", { isLoggedIn, products });
          } else {
            const email = await logemail.email;
            email2 = email;
            generateOtp();
            console.log(otp);
            sendVerifyMail(email, otp);
            // render to the otp page after these
            res.render("otpPage");
          }
        } else {
          res.render("login", { message: "you are blocked by admin" });
        }
      } else if (!logemail) {
        res.render("login", { email: "INVALID PASSWORD" });
      } else {
        res.render("login", { password: "INVALID PASSWORD" });
      }
    } else {
      res.render("login", { email: "INVALID EMAIL" });
    }
  } catch (err) {
    console.log(err);
  }
};

//==========================LODING SIGN UP PAGE======================================
const SignUp = (req, res) => {
  res.render("register");
};

//=============================INSERTING USER REGISTERED DATA=============================

const insertUser = async (req, res) => {
  try {
    // Check if the email already exists
    const checkEmail = await User.findOne({ email: req.body.email });

    if (checkEmail) {
      res.render("register", {
        name: req.session.name,
        error: "User Already Exists Please login",
      });
    } else {
      // Hash the password
      const secPassword = await securePassword(req.body.password, 10);

      // Create a new user object
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        gender: req.body.gender,
        password: secPassword,
      });
      // Save the user to the database

      const status = await User.insertMany([user]);
      const email = req.body.email;
      email2 = email;

      if (status) {
        generateOtp();
        console.log(otp);
        sendVerifyMail(email, otp);
        // render to the otp page after these
        res.render("otpPage");

        console.log(user);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

//======================otp validation=================
const validotp = async (req, res) => {
  try {
    const otpDigits = [];

    // Extract OTP digits from request query parameters
    for (let i = 1; i <= 6; i++) {
      const digit = req.query[`digit-${i}`];
      if (digit) {
        otpDigits.push(digit);
      }
    }
    console.log(otpDigits);
    const userOtp = otpDigits.join("");
    console.log(userOtp);
    // Now you have the complete OTP as a string
    // You can further validate or use it as needed

    if (otp != null) {
      if (userOtp == otp) {
        const verified1 = await User.updateOne(
          { email: email2 },
          { $set: { verified: true } },
          { upsert: true }
        );
        if (verified1) {
          res.render("login", { message: "please login now" });
          console.log(userOtp, otp);
        } else {
          res.render("otpPage");
        }
        // } else {
        //   console.log("enter valid otp"); // Move this line here
        //   res.render("register");
      } else {
        res.render("otpPage", { message: "Entered Otp Doesnt Match" });
      }
    } else {
      res.render("otpPage", {
        message: "⌛ This Otp is Not Valid Request a new Otp",
      });
    }
  } catch (error) {
    console.error(error); // Pass the 'error' variable to console.error()
  }
};

//==================resend otp===============
const resendOtp = async (req, res) => {
  try {
    generateOtp();
    console.log(otp);
    sendVerifyMail(email2, otp);
    res.status(200).json({ message: "OTP has been sent" });
  } catch (error) {
    console.log(error);
  }
};

//=================Logout================

const Logout = async (req, res) => {
  try {
    req.session.user_id = false;
    req.session.name = false;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};
//=================ProdectPage================
const productPage = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (req.session.user_id) {
      const isLoggedIn = true;

      const already = await Cart.findOne({
        userid: req.session.user_id,
        "items.productid": productId,
      });
      if (already) {
        res.render("product-details", { isLoggedIn, product, already });
      } else {
        res.render("product-details", { isLoggedIn, product });
      }
    } else {
      res.render("product-details", { isLoggedIn: false, product });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//===========================Payment things =============================
const createOrder = async (req, res) => {
  try {
    const id = req.session.user_id;
    const total = await Cart.findOne({ userid: id }).populate("items.total");
    const datatotal = total.items.map((item) => {
      return item.total * item.count;
    });

    let totalsum = 0;
    if (datatotal.length > 0) {
      totalsum = datatotal.reduce((x, y) => {
        return x + y;
      });
    }
    console.log(totalsum);

    console.log("create order");
    const options = {
      amount: totalsum * 100, // Amount in smallest currency unit (e.g., paisa)
      currency: "INR", // Currency code
      receipt: `order_rcptid_${Math.floor(Math.random() * 1000)}`,
    };
    console.log("create order222");
    const order = await Razorpay.orders.create(options);
    console.log(order, ";aosdfhasjf");
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

//==========================Verify order =========================
const verifypayment = async (req, res) => {
  try {
    console.log("verifff");

    const user_id = req.session.user_id;
    const paymentData = req.body;
    const cartData = await Cart.find({ userid: user_id });

    console.log(
      "+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
    );

    console.log(cartData);

    const hmac = crypto.createHmac("sha256", process.env.key_secret);
    hmac.update(
      paymentData.payment.razorpay_order_id +
        "|" +
        paymentData.payment.razorpay_payment_id
    );
    console.log(hmac);
    const hmacValue = hmac.digest("hex");
    if (hmacValue === paymentData.payment.razorpay_signature) {
      //     const productIds = cartData.products.map((product) => product.productId);
      // console.log("Product IDs:", productIds);
      //       await product.findByIdAndUpdate(
      //         { _id: productIds },
      //         { $inc: { quantity: -count } })

      // await Order.findByIdAndUpdate(
      //   { _id: paymentData.order.receipt },
      //   {
      //     $set: {
      //       paymentStatus: "placed",
      //       paymentId: paymentData.payment.razorpay_payment_id,
      //     },
      //   }
      // );

      // await Cart.deleteOne({ userid: user_id });
      console.log("XP 9");
      res.json({ placed: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//===============================PLace Order============================
const placeOrder = async (req, res) => {
  try {
    let addressid;

    const id = req.session.user_id;
    //  console.log(req.body)
    const formData = req.body.formData;
    const val = req.body.val;

    if (val == 1) {
      const newAddress = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        zip: formData.zipcode,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
      };
      const savedAddress = await User.findOneAndUpdate(
        { _id: id },
        { $set: { _id: id }, $push: { addresses: newAddress } },
        { upsert: true, new: true }
      );

      addressid = await savedAddress.addresses[
        savedAddress.addresses.length - 1
      ]._id;
      console.log(addressid);
    } else if (val == 0) {
      console.log("not Saving");

      const newAddress = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        zip: formData.zipcode,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
      };

      const savedAddress = await User.findOneAndUpdate(
        { _id: id },
        { $set: { _id: id }, $push: { tempaddress: newAddress } },
        { upsert: true, new: true }
      );

      addressid = await savedAddress.addresses[
        savedAddress.addresses.length - 1
      ]._id;
    } else {
      addressid = formData.addressid;
    }

    const payment = formData.payMethod;
    // console.log(addressid);
    const status = payment == "COD" ? "Pending" : "Paid";

    const addressdata =
      val == 0
        ? await User.findOne(
            { _id: id },
            { tempaddress: { $elemMatch: { _id: addressid } } }
          )
        : await User.findOne(
            { _id: id },  
            { addresses: { $elemMatch: { _id: addressid } } }
          );

    console.log(addressdata);

    const carts = await Cart.findOne({ userid: id });
    const total = await Cart.findOne({ userid: id }).populate("items.total");
    const datatotal = total.items.map((item) => {
      return item.total * item.count;
    });
    ///

    const cartData = await Cart.findOne({ userid: id });
    const cartitems = await Cart.findOne({ userid: id }).populate(
      "items.productid"
    );
    ///

    let totalsum = 0;
    if (datatotal.length > 0) {
      totalsum = datatotal.reduce((x, y) => {
        return x + y;
      });

      const datas = new Order({
        user_Id: id,
        // deliveryDetails: addressdata.addresses[0],
        addresses: addressdata.addresses[0],
        items: carts.items,
        purchaseDate: Date.now(),
        totalAmount: totalsum,
        status: "Placed",
        paymentMethod: payment,
        paymentStatus: status,
        shippingMethod: "Express",
        shippingFee: "0",
      });
      const orderdata = await datas.save();
      // if (payment == "cod") {
      let data = cartData.items;

      for (let i = 0; i < data.length; i++) {
        let products = data[i].productid;
        let count = data[i].count;
        // console.log(Product);

        await Product.updateOne({ _id: products }, { $inc: { stock: -count } });
      }
      console.log("sdfewssdgdf");
      await Cart.deleteOne({ userid: id });

      res.json({ sucess: true });
      // }
      //  else if (payment == "Wallet") {
      //   return res.json({ online: true });
      // } else {
      //   const options = {
      //     amount: totalsum * 100,
      //     currency: "INR",
      //     receipt: "" + orderdata._id,
      //   };

      // }
      //   res.render('orderplaced',{user:req.session.name,data,cartdata});
    }
  } catch (error) {
    console.log(error.message);
  }
};

//====================orderSuccess=============
const orderSuccess = async (req, res) => {
  try {
    res.render("orderSuccess");
  } catch (error) {
    console.log(error.message);
  }
};

//======================Order Details =============================
const orderDetails = async (req, res) => {};

//=========================Search =================
const search = async (req, res) => {
  try {
    const data = req.query.searchData;
    console.log(data);
    const products = await Product.find({
      name: { $regex: new RegExp(data, "i") },
    });

    const isLoggedIn = req.session.user_id ? true : false;
    const categories = await Catagory.find({ status: "active" });
    res.render("shop", { products, isLoggedIn , categories});
  } catch (error) {
    console.log(error.message);
  }
};

const filter = async (req, res) => {
  try {
    console.log(req.body);
    const minamountfrombody = req.body.minamount;
    const maxamountfrombody = req.body.maxamount;

    const minamountstr = minamountfrombody.replace("$", "");
    const maxamountstr = maxamountfrombody.replace("$", "");

    const minamount = parseInt(minamountstr);
    const maxamount = parseInt(maxamountstr);

    const products = await Product.find({
      price: { $gte: minamount, $lte: maxamount },
    });
    const isLoggedIn = (await req.session.user_id) ? true : false;
    const categories = await Catagory.find({ status: "active" });
    res.render("shop", { isLoggedIn, products , categories });
  } catch (error) {
    console.log(error.message);
  }
};



//===================filter Category=================
const filterCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category: category });
    console.log(products);
    const isLoggedIn = (await req.session.user_id) ? true : false;
    const categories = await Catagory.find({ status: "active" });
    res.render("shop", { products , isLoggedIn, categories });
  } catch (error) {
    console.log(error.message);
  }
}



//=========================cancelOrder======================
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Retrieve order details by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status to "Cancelled"
    await Order.findByIdAndUpdate(orderId, { status: "Cancelled" });

    // Restore stock for each product in the cancelled order
    for (const item of order.items) {
      const productId = item.productid;
      const quantity = item.count;

      // Update product stock by adding the cancelled quantity
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: quantity },
      });
    }

    // Redirect or send a response
    return res.redirect("/userProfile");
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//==========================Cart Page===========================
// const loadcart = async (req,res)=>{
//   res.render('cart')
// }

const loadshop = async (req, res) => {
  const products = await Product.find({ status: "active" });
  const isLoggedIn = (await req.session.user_id) ? true : false;
  const categories = await Catagory.find({status: "active"});
  res.render("shop", { products, isLoggedIn , categories});
};

module.exports = {
  insertUser,
  login,
  home,
  SignUp,
  loginvalid,
  validotp,
  resendOtp,
  Logout,
  productPage,
  // loadcart,
  loadshop,
  userinfo,
  updateUser,
  addNewAddress,
  editAddress,
  placeOrder,
  deleteAddress,
  updateAddress,
  orderSuccess,
  createOrder,
  verifypayment,
  search,
  filter,
  filterCategory,
  cancelOrder,
};
