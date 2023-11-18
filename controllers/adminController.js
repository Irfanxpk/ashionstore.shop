const Admin = require("../models/adminModel");
const Category = require("../models/category");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Product = require('../models/Product');
const multer = require('multer');
const Order = require('../models/orderModel');
//================loading errors =============================
const loadError = async (req, res) => {
  try {
    res.status(404).render("404");
  } catch (error) {
    console.log(error.message);
  }
};

//==========================loading Admin page =========================
const loadAdmin = async (req, res) => {
  try {
    // res.send("hello world")
    res.render("signin");
  } catch (error) {
    console.log(error.message);
  }
};

//================logout Admin page =========================
const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.render("signin");
  } catch (error) {
    console.log(error.message);
  }
}



const admdata = { email: "pkirfanx@gmail.com", password: "8281", Name: "irfan" }



//==========================  Admin Authorization ====================
const adminLogin = async (req, res) => {
  try {
    // const email = req.body.email;
    const email = req.body.email
    const password = req.body.password;

    if (admdata.email == email) {

      if (admdata.password == password) {
        req.session.admin_id = admdata.Name;

        const user = await User.find()
        res.redirect("/admin/index");
        // res.render("index", { user });
      } else {
        res.render("signin", { message: "Wrong password..!!" });
      }

    } else {
      res.render("signin", { message: "Entered email not exist." });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//=================Block User==================
const blockUser = async (req, res) => {
  try {
    const userId = req.params.userId; // Extract the user's ID from the request
    await User.findByIdAndUpdate(userId, { status: 'blocked' });
    const user = await User.find()
    res.render('index',{user}); 
  } catch (error) {
    res.status(500).send('Error blocking user');
  }
};

//================Unblock User================
const unblockUser = async (req, res) => {
  try {
    const userId = req.params.userId; // Extract the user's ID from the request
    await User.findByIdAndUpdate(userId, { status: 'active' });
    const user = await User.find()
    res.render("index", {user}); 
  } catch (error) {
    res.status(500).send('Error unblocking user');
  }
}

//==================load dash==================
const loadDash = async (req, res) => {
  const user = await User.find()
  res.render("index", {user});
};

//================load product catogory================

const loadCategory = async (req, res) => {
  const category = await Category.find()
  res.render("category", {category});
};

//=================Load add Catagory================
const loadAddCat = async (req, res) => {
  res.render("addCategory");
}
//==================add category================
const addCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const category = new Category({ name, description });
    const check = await Category.find({ name:category.name});
    if(check!=false) {
      res.render("addCategory",{message:"Category already exist"})
    }else{
    await category.save();
    res.redirect('/admin/category');
    }
  } catch (error) {
    console.error(error);
  }
}

//================load Edit Category================
const loadEdit = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id); // Find the category by ID
    res.render('editCategory', { category});
  } catch (error) {
    console.error(error);
  }
};

//================EDIT CATOGORY================
const updateCategory = async (req, res) => {
  try {
    const updatedCategory = {
      name: req.body.name,
      description: req.body.description,
    };

    await Category.findByIdAndUpdate(req.params.id, updatedCategory); // Update the category by ID
    res.redirect('/admin/category'); // Redirect back to the category list page
  } catch (error) {
    console.error(error);
  }
};

const categoryRemove = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send('Category not found');
    }

    await Category.findByIdAndRemove(categoryId);
    res.redirect('/admin/category');
  } catch (error) {
    console.error(error);
  }}

//==================Block or unblock Category================

const categoryBlock = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send('Category not found');
    }

    category.status = 'blocked';
    await category.save();

    const prd = await Product.updateMany(
      { category: categoryId },
      { status: "blocked" }
    );
    res.redirect('/admin/category');
  } catch (error) {
    console.error(error);
  }
};

const categoryUnblock = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send('Category not found');
    }

    category.status = 'active';
    await category.save();

   const prd = await Product.updateMany(
     { category: categoryId },
     { status: "active" }
   );
    res.redirect('/admin/category');
  } catch (error) {
    console.error(error);
  }
};

const orders = async (req, res)=>{

  try {
const orders = await Order.find()
res.render('orders',{orders})
  } catch (error){
    console.error(error);
  }
};

const changeOrderStatus = async (req, res)=>{
  try {
console.log('change order status')
    const id = req.params.id
    console.log(id)
    const status = req.body.newStatus;
    console.log(status)

    const change = await Order.updateOne(
      { _id: id },
      { $set: { status: status } }
    );

    console.log(change)
    if(change){
       res.json({
         success: true,
         message: "Order status updated successfully",
         order: updatedOrder,
       });
    }
    
  }catch (error){
res
  .status(500)
  .json({ success: false, message: "Error updating order status" });
  }
}

module.exports = {
  loadAdmin,
  loadError,
  adminLogin,
  blockUser,
  unblockUser,
  loadDash,
  loadCategory,
  loadEdit,
  updateCategory,
  addCategory,
  loadAddCat,
  categoryRemove,
  categoryBlock,
  categoryUnblock,
  adminLogout,
  orders,
  changeOrderStatus,
};