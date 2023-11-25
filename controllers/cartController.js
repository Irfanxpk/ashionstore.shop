const Category = require("../models/category");
const User = require("../models/User");
const Product = require("../models/Product");
const Cart = require("../models/cartModel");
const { response } = require("../routes/adminRoutes");



//=================loading cart ==================

const loadCart = async (req, res) => {
  try {


    const id = req.session.user_id;
    const data = await Cart.find({ userid: id });
    const total = await Cart.findOne({ userid: id }).populate("items.total");
    console.log(total);
    
    const standard = 49;
    const express = 99;
    console.log("ex")
    
    let datatotal

    // if (data[0].items.length > 0){
     datatotal = total.items.map((item) => {
      return item.total * item.count;
    });
  // }
    console.log("da");
    
    let totalsum = 0;
    if (datatotal.length > 0) {
      totalsum = datatotal.reduce((x, y) => {
        return x + y;
      });
    }
    console.log("tot");
    
    const cartdata = await Cart
    .find({ userid: id })
    .populate("items.productid");
    
    console.log(cartdata);
    // if (cartdata.items.length > 0) {
        console.log(data[0].items.length);
        if (data) {
          res.render("cart", {
            isLoggedIn: true,
            user: req.session.name,
            cartdata,
            data,
            id,
            totalsum,
            // express,
            // standard,
          });
        // }
      } else {
        console.log("Your cart is empty.");
      }
  } catch (error) {
    console.log(error.message);
  }
};




//===================adding product=========================================
const addtocart = async (req, res) => {
  try {
    const id = req.session.user_id;
    const productid = req.params.id;

    const data = await Product.findOne({ _id: productid });
    console.log(data);
    const cartdata = await Cart.findOne({
      userid: id,
      "items.productid": productid,
    });

    if (id) {
      if (data) {
        if (cartdata) {
          console.log("Existing data on cart");
          await Cart.updateOne(
            { userid: id, "items.productid": productid },
            { $inc: { "items.$.count": 1 } }
          );
          console.log("Cart product count increased");
          res.json({ success: false, message: "Already in the cart" });
        } else {
          const cartitems = {
            productid: data._id,
            name: data.name,
            count: 1,
            total: data.price,
            img: data.images[0],
          };

          await Cart.findOneAndUpdate(
            { userid: id },
            { $set: { userid: id }, $push: { items: cartitems } },
            { upsert: true, new: true }
          );

          console.log("product added to the cart");
         res.json({
           success: true,
           message: "Product added to cart successfully",
         });
        }
      } else {
        res.json({ success: false });
      }
    } else {
      res.json({ success: false, message: "please Login" });
      console.log("Login required");
    }
  } catch (error) {
    console.log(error.message);
  }
};








// const addtocart = async (req, res) => {
//   const userID = req.session.user_id;
//   const productID = req.params.id;
//   console.log(productID);

//   const product = await Product.findOne({ _id: productID });
//   console.log(product);

//   const getcart = await Cart.findOne({
//     userid: userID,
//     "items.product": productID,
//   });
//   // console.log(getcart)

//   if (userID) {
//     const cartitems = {
//       productid: product._id,
//       count: 1,
//       total: product.price,
//     };

//     console.log(cartitems);

//     await Cart.findOneAndUpdate(
//       { userid: userID },
//       { $set: { userid: userID }, $push: { items: cartitems } },
//       { upsert: true, new: true }
//     );

//     res.json({
//       success: true,
//       message: "Product added to cart successfully",
//     });
//   }
// };


//=============================Adding quantity in cart =============================

const ProductCount = async (req, res) => {
  try {
    const productid = req.body.productID;
    const id = req.session.user_id;
    const val = req.body.quantity; 
    const data = await Product.findOne({ _id: productid });
    const cartitems = await Cart
      .findOne({ userid: id })
      .populate("items.productid");

    // if (data.stock > 0) {
      if (val == 1) {
        if (data.stock > 0) {
          await Cart.updateOne(
            { userid: id, "items.productid": productid },
            { $inc: { "items.$.count": 1 } }
          );
          console.log("count increased");
 
          res.json({ success: true });
        } else {
          // res.json({ success: false });
        }
      } else if (val == -1) {
         if (data.stock > 0) {
        await Cart.updateOne(
          { userid: id, "items.productid": productid },
          { $inc: { "items.$.count": -1 } }
        );
        console.log("count decreased");

        res.json({ success: true });
      }else {
        res.json({ success: false });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};


//======================delete product from cart =================

const deleteCartItems = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id);
    const sessionid = req.session.user_id;

    const data = await Cart.updateOne(
      { userid: sessionid },
      { $pull: { items: { productid: id } } }
    );
    console.log(data);
    if (data) {
      res.json({ success: true });
    } else {
      console.log("error");
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//===================loading checkouts =================
const loadChekout = async (req, res) => {
  try {
    const id = req.session.user_id;
    const data = await Cart.find({ userid: id });
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

    const userData = await User.findOne({ _id: id})

    const cartdata = await Cart
      .find({ userid: id })
      .populate("items.productid");

    if (data) {
      res.render("checkout", {
        user: req.session.name,
        isLoggedIn:true,
        userData,
        cartdata,
        data,
        id,
        totalsum,
        // express,
        // standard,
      });
    } else {
      console.log("Your cart is empty.");
    }
  } catch (error) {
    console.log(error.message);
  }
};


module.exports = {
  addtocart,
  loadCart,
  ProductCount,
  deleteCartItems,
  loadChekout,
};