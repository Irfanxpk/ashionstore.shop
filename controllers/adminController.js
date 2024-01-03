const Admin = require("../models/adminModel");
const Category = require("../models/category");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Product = require('../models/Product');
const multer = require('multer');
const Order = require('../models/orderModel');
let pdf = require("html-pdf");
const ejs = require("ejs");
const fs = require("fs");
const ExcelJS = require("exceljs");
const path = require("path");
const archiver = require("archiver");

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



const UserManage = async (req, res) => {
  try {
    const user = await User.find()
    res.render("userManagment", { user });
  } catch (error) {
    console.log(error.message);
  }
}


//=================Block User==================
const blockUser = async (req, res) => {
  try {
    const userId = req.params.userId; // Extract the user's ID from the request
    await User.findByIdAndUpdate(userId, { status: 'blocked' });
    res.redirect("/admin/UserManage"); 
  } catch (error) {
    res.status(500).send('Error blocking user');
  }
};

//================Unblock User================
const unblockUser = async (req, res) => {
  try {
    const userId = req.params.userId; // Extract the user's ID from the request
    await User.findByIdAndUpdate(userId, { status: 'active' });
    res.redirect("/admin/UserManage"); 
  } catch (error) {
    res.status(500).send('Error unblocking user');
  }
}

const donutChartData = async (req, res) => {
  try {
    const orderDonutChartData = await Order.aggregate([
      {
        $group: {
          _id: "$status", // Group by status
          count: { $sum: 1 }, // Count documents for each status
        },
      },
    ]);

    // Format the data as needed for the frontend
    const labels = orderDonutChartData.map((item) => item._id);
    const values = orderDonutChartData.map((item) => item.count);
    const colors = ["#FF6384", "#36A2EB", "#FFCE56"]; // Define colors as needed

    res.json({ labels, values, colors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const barChartData = async (req, res) => {
  try {
    const paymentBarChartData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid", // Filter for paid orders
        },
      },
      {
        $facet: {
          CODPayments: [
            {
              $match: { paymentMethod:"COD"},
            },
            {
              $group: {
                _id: { $month: "$Date" }, // Extract month from the Date field
                totalAmount: { $sum: "$totalAmount" }, // Calculate total amount for COD payments in each month
              },
            },
          ],
          OnlinePayments: [
            {
              $match: { paymentMethod:"Online"},
            },
            {
              $group: {
                _id: { $month: "$Date" }, // Extract month from the Date field
                totalAmount: { $sum: "$totalAmount" }, // Calculate total amount for online payments in each month
              },
            },
          ],
        },
      },
    ]);

    console.log(paymentBarChartData);
    // Format the data for the frontend
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const CODData = paymentBarChartData[0].CODPayments.map((item) => ({
      month: monthNames[item._id - 1],
      COD: item.totalAmount || 0,
    }));

    const OnlineData = paymentBarChartData[0].OnlinePayments.map((item) => ({
      month: monthNames[item._id - 1],
      Online: item.totalAmount || 0,
    }));

    const combinedData = monthNames.map((month) => {
      const COD = CODData.find((data) => data.month === month)?.COD || 0;
      const Online =
        OnlineData.find((data) => data.month === month)?.Online || 0;
      return { month, COD, Online };
    });

    // Prepare data for labels and datasets
    const labels = monthNames;
    const datasets = [
      {
        label: "Cash on Delivery",
        data: combinedData.map((item) => item.COD),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Online Payment",
        data: combinedData.map((item) => item.Online),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ];

    res.json({ labels, datasets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





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
const startOfToday = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);
const endOfToday = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + 1
);

const todaytotal = await Order.aggregate([
  {
    $match: {
      Date: {
        $gte: startOfToday,
        $lt: endOfToday,
      },
    },
  },
  {
    $group: {
      _id: null,
      totalAmount: { $sum: "$totalAmount" },
    },
  },
]);


  if (Total.length == 0) {
    // Total[0].totalAmount = 0

    res.render("index", {user , ordractve});
  }else if (todaytotal.length == 0) {

    res.render("index", { user, ordractve, Total : Total[0].totalAmount ,today : 0 });
  }else{
   

  res.render("index", { user, ordractve, Total : Total[0].totalAmount , today: todaytotal[0].totalAmount});
  }

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

const categoryOffer = async (req, res) => {

  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send('Category not found');
    }else if (category){

     res.render('categoryOffer', { category });
    }
  
  
  }
    catch (error) {
      console.log(error.message)
    }
}

const categoryOfferEdit = async (req, res) => { 
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send('Category not found');
    }else if (category){
      
      category.offer = {
        discount: req.body.discount,
        validFrom: req.body.validFrom,
        validUntil: req.body.validUntil
      }
     await category.save();

     const categoryOffer = category.offer;

     if (categoryOffer){
       console.log(categoryOffer)
      await Product.updateMany({ category: categoryId }, {categoryOffer});
      res.redirect('/admin/category');
     }else{
      res.redirect('/admin/category');
     }

     
    }
}  catch (error) {
  console.log(error.message)
}
}



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
// const SalesReport = async (req, res) => {
//   try {
//   const orderdata = await Order.find({})
//   ejs.renderFile(
//     path.join(__dirname, "../views/admin/", "report-template.ejs"),
//     {
//       orderdata,
//     },
//     (err, data) => {
//       if (err) {
//         res.send(err);
//       } else {
//         let options = {
//           height: "11.25in",
//           width: "8.5in",
//           header: {
//             height: "20mm",
//           },
//           footer: {
//             height: "20mm",
//           },
//         };
//         pdf.create(data, options).toFile("report.pdf", function (err, data) {
//           if (err) {
//             res.send(err);
//           } else {
//             const pdfpath = path.join(__dirname, "../report.pdf");
//             res.sendFile(pdfpath);
//           }
//         });
//       }
//     }
//   );

//   } catch (error) {
//     console.log(error.message);
//   }
// }

// const exel = async (req, res) => {
//    try {
//     // Fetch orders from the database
//     console.log("exel");
//     const orders = await Order.find().lean(); // Retrieve orders as plain JavaScript objects
    
//     // Create a workbook and worksheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Sales Report');

//     // Adding headers to the worksheet
//     worksheet.addRow(['Order ID', 'User ID', 'Purchase Date', 'Total Amount', 'Status', 'Payment Method', 'Shipping Method']);

//      console.log("exel");
//     // Loop through the orders and add data to the worksheet
//     orders.forEach(order => {
//       worksheet.addRow([
//         order._id.toString(), // Assuming _id is an ObjectId
//         order.user_Id,
//         new Date(order.purchaseDate).toLocaleString(), // Assuming purchaseDate is a Date
//         order.totalAmount,
//         order.status,
//         order.paymentMethod,
//         order.shippingMethod
//       ]);
//     });

//      console.log("exel");
//     // Generate the Excel file
//     const fileName = 'sales_report.xlsx';
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
//     await workbook.xlsx.write(res);

//     // Send the response
//     res.end();
//   } catch (error) {
//     console.error('Error generating Excel file:', error);
//     res.status(500).send('Error generating Excel file');
//   }
// };




const SalesReport = async (req, res) => {
  try {
    const orderdata = await Order.find({});
    let pdfPath, excelPath;

    // Generating PDF
    const pdfPromise = new Promise((resolve, reject) => {
      ejs.renderFile(
        path.join(__dirname, "../views/admin/", "report-template.ejs"),
        { orderdata },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            let options = {
              height: "11.25in",
              width: "8.5in",
              header: { height: "20mm" },
              footer: { height: "20mm" },
            };
            pdf
              .create(data, options)
              .toFile("report.pdf", function (err, data) {
                if (err) {
                  reject(err);
                } else {
                  pdfPath = path.join(__dirname, "../report.pdf");
                  resolve();
                }
              });
          }
        }
      );
    });

    // Generating Excel
    const excelPromise = new Promise(async (resolve, reject) => {
      try {
        const orders = await Order.find().lean();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sales Report");
        worksheet.addRow([
          "Order ID",
          "User ID",
          "Purchase Date",
          "Total Amount",
          "Status",
          "Payment Method",
          "Shipping Method",
        ]);

        orders.forEach((order) => {
          worksheet.addRow([
            order._id.toString(),
            order.user_Id,
            new Date(order.purchaseDate).toLocaleString(),
            order.totalAmount,
            order.status,
            order.paymentMethod,
            order.shippingMethod,
          ]);
        });

        excelPath = path.join(__dirname, "../sales_report.xlsx");
        await workbook.xlsx.writeFile(excelPath);
        resolve();
      } catch (error) {
        reject(error);
      }
    });

   
    await Promise.all([pdfPromise, excelPromise]);

   
    const zip = archiver("zip");
    res.attachment("sales_reports.zip"); 

    zip.file(pdfPath, { name: "report.pdf" }); 
    zip.file(excelPath, { name: "sales_report.xlsx" }); 
    zip.pipe(res);
    zip.finalize();
  } catch (error) {
    console.error("Error generating ZIP file:", error);
    res.status(500).send("Error generating ZIP file");
  }
};


module.exports = {
  loadAdmin,
  loadError,
  adminLogin,
  UserManage,
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
  categoryOffer,
  adminLogout,
  orders,
  changeOrderStatus,
  sales,
  filterByDate,
  SalesReport,
  categoryOfferEdit,
  donutChartData,
  barChartData,
};