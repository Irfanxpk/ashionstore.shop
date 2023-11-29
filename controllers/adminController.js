const Admin = require("../models/adminModel");
const Category = require("../models/category");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Product = require('../models/Product');
const multer = require('multer');
const Order = require('../models/orderModel');
let pdf = require("html-pdf");
const ejs = require("ejs");
const path = require("path");
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
    res.redirect('/admin/index'); 
  } catch (error) {
    res.status(500).send('Error blocking user');
  }
};

//================Unblock User================
const unblockUser = async (req, res) => {
  try {
    const userId = req.params.userId; // Extract the user's ID from the request
    await User.findByIdAndUpdate(userId, { status: 'active' });
    res.redirect("/admin/index"); 
  } catch (error) {
    res.status(500).send('Error unblocking user');
  }
}

//==================load dash==================
const loadDash = async (req, res) => {
 
 try { const user = await User.find()
  const ordractve = await Order.find({ status: "Placed" })
  const Total = await Order.aggregate([
    {
      $match: {
        status: "Delivered",
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$totalAmount" },
      },
    },
  ]);


const today = new Date();
today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for comparison

const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1); // Get the date for tomorrow to filter today's orders



  if (Total.length == 0) {
    // Total[0].totalAmount = 0

    res.render("index", {user , ordractve});
  }else {
  
  res.render("index", { user, ordractve, Total : Total[0].totalAmount});
  console.log(Total[0].totalAmount);

};

} catch (error) {
  console.log(error.message);
}
}
//================load product catogory================

const loadCategory = async (req, res) => {
  try {
  const category = await Category.find()
  res.render("category", {category});
  }catch (error) {
  console.log(error.message)
  }
};

//=================Load add Catagory================
const loadAddCat = async (req, res) => {
  try {
  res.render("addCategory");
  }catch (error) {
    console.log(error.message)
  }
}
//==================add category================
const addCategory = async (req, res) => {
  
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    const categoryName = category.name.toLowerCase();

// Check for existing categories with the normalized name
const check = await Category.find({ name: categoryName });
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

    const name= req.body.name
    const description= req.body.description
    
     const category = await Category.findById(req.params.id)
    const categoryName = name.toLowerCase();
    if (categoryName != category.name) {

      console.log("hello")
// Check for existing categories with the normalized name
const check = await Category.find({ name: categoryName });
const category = await Category.findById(req.params.id); // Find the category by ID
    if(check!=false) {
      res.render("editCategory", { category });

    }else{
      res.render("editCategory", { category ,message:"Category already exist"});
    }
  }else{
    
        const updatedCategory = {
          name: req.body.name,
          description: req.body.description,
        };
    
        await Category.findByIdAndUpdate(req.params.id, updatedCategory); // Update the category by ID
        res.redirect('/admin/category'); // Redirect back to the category list page
      
      }
    



  } catch (error) {
    console.error(error);
  }
};

const categoryRemove = async (req, res) => {
  
  try {
    const categoryId = req.params.categoryId;
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
  
  try {
    const categoryId = req.params.categoryId;
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
  
  try {
    const categoryId = req.params.categoryId;
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




//============sales report================
const sales = async (req, res) => {
 try {

   const { status } = req.query;
 

   if (status) {
     const regexPattern = new RegExp(status, 'i');
     console.log(regexPattern)
     const orderdata = await Order
       .find({ status : regexPattern })
       .sort({ purchaseDate: -1 });
       console.log(orderdata);
     res.render("sales",{orderdata});
   }else{
   
   const orderdata = await Order
     .find()
     .sort({ purchaseDate: -1 });
   // const orderproducts = await order.aggregate([{$project:{"items.productid":productname}}]).populate("items.productid")
   // console.log(orderproducts);

   res.render("sales",{orderdata});
   }
 } catch (error) {
   console.log(error.message);
 }

}






//==================filter By date==================
const filterByDate = async (req, res) => {
  try {
    console.log(req.query)
    const {startDate, endDate} = req.query
   const orderdata = await Order.find({
     purchaseDate: {
       $gte: startDate,
       $lte: endDate,
     },
   }).sort({ Date: -1 });

      console.log(orderdata)
    res.json(orderdata)
  }catch(error){
    console.log(error.message);
  }
}

//===============Sales Report================
const SalesReport = async (req, res) => {
  try {
  const orderdata = await Order.find({})
  ejs.renderFile(
    path.join(__dirname, "../views/admin/", "report-template.ejs"),
    {
      orderdata,
    },
    (err, data) => {
      if (err) {
        res.send(err);
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
        pdf.create(data, options).toFile("report.pdf", function (err, data) {
          if (err) {
            res.send(err);
          } else {
            const pdfpath = path.join(__dirname, "../report.pdf");
            res.sendFile(pdfpath);
          }
        });
      }
    }
  );

  } catch (error) {
    console.log(error.message);
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
  sales,
  filterByDate,
  SalesReport,
};