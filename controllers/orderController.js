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




const verifypayment = async (req, res) => {
  try {
    console.log("verifff");

    const user_id = req.session.user_id;
    const paymentData = req.body;
    const cartData = await Cart.find({ userid: user_id });
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
      res.json({ placed: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
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

      if(req.session.offer == 15){
        totalsum = totalsum - (totalsum * 15) / 100
        req.session.offer = null
      }

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
    res.status(500).json({ message: "Error" });
  }
};

//====================orderSuccess=============
const orderSuccess = async (req, res) => {
  try {
    res.render("orderSuccess");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error" });
  }
};




const singleOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log(orderId);
    const order = await Order.findById(orderId);
    console.log(order);
    const isLoggedIn = (await req.session.user_id) ? true : false;
    res.render("orderDetails", { order, isLoggedIn });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server error" });
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

    // const discount = totalsum * 0.15;
    //    chek = totalsum - discount;
    //   console.log(Math.floor(chek))
    //   console.log(chek , req.session.offer);

    // console.log(totalsum , req.sesion.offer);
    let chec = 0
    if(req.session.offer == 15){
      // totalsum = totalsum - (totalsum * 15) / 100;
      const discount = totalsum * 0.15;
      chec = totalsum - discount;
      const totalsum =  Math.floor(chec);
      console.log(totalsum )

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
    res.status(500).json({ message: "internal server error" });
  }
};




const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    console.log("cancelling order");
    // Retrieve order details by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status to "Cancelled"
    // await Order.findByIdAndUpdate(orderId, { status: "Cancelled" });
    await Order.findByIdAndUpdate(orderId, {
      status: "Cancelled",
      paymentStatus: "Refunded",
    });

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
    // return res.redirect("/userProfile");
    res.status(200).json({ message: "Order cancelled successfully." });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const downloadInvoice = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    ejs.renderFile(
      path.join(__dirname, "../views/user/", "invoice.ejs"),
      {
        order,
      },
      (err, data) => {
        if (err) {
          res.send(err.message);
        } else {
          let options = {
            height: "11.25in",
            width: "8.5in",
            header: {
              height: "20mm",
            },
            footer: {
              height: "20mm",
            },
          };
          pdf.create(data, options).toFile("invoice.pdf", function (err, data) {
            if (err) {
              res.send(err);
            } else {
              const pdfpath = path.join(__dirname, "../invoice.pdf");
              res.sendFile(pdfpath);
            }
          });
        }
      }
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server error" });
  }
};


module.exports = {
  placeOrder,
  orderSuccess,
  createOrder,
  verifypayment,
  cancelOrder,
  downloadInvoice,
  singleOrderDetails,
};