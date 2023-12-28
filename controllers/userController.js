const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const pdf = require("html-pdf");
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
        pass: "wtxt yjsb qaxu hdxx",
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
  try {
   const isLoggedIn = (await req.session.user_id) ? true : false;
  const products = await Product.findMany({ status: "active" });

  res.render("index", { isLoggedIn, products });
  } catch (error) {
    console.log(error.message);
  }
};

//sample user info

const userinfo = async (req, res) => {

  try {
    
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
  }catch(err) {
    console.error(err);
  }
};

const updateUser = async (req, res) => {

  try {
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
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}
};

//==========================loding login page============================================
const login = async (req, res) => {
  try {
  if (req.session.name) {
    const isLoggedIn = true;
    const products = await Product.find();
    res.render("index", { isLoggedIn, products });
  } else {
    res.render("login");
  }
}catch(err){
  console.log(err);
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
  try {
  res.render("register");
  } catch (err) {
    console.log(err);
  }
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
          const user = await User.findOne({ email: email2 });
         req.session.user_id = user._id

         console.log(req.session.user_id);

          res.redirect("/");
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

    console.log(products);
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


//==========================Cart Page===========================
// const loadcart = async (req,res)=>{
//   res.render('cart')
// }

//============download invoice =============================


const loadshop = async (req, res) => {
  try {
  const products = await Product.find({ status: "active" });
  const isLoggedIn = (await req.session.user_id) ? true : false;
  const categories = await Catagory.find({status: "active"});
  res.render("shop", { products, isLoggedIn , categories});
  }catch(err){
    console.log(err)
  }
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
  search,
  filter,
  filterCategory,
};
