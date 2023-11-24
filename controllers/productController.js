const Admin = require("../models/adminModel");
const Category = require("../models/category");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Product = require("../models/Product");
const multer = require("multer");




//=================load products =============================

const loadProduct = async (req, res) => {
  try {
  const product = await Product.find()
  res.render("product", {product});
  } catch (error) {
    console.log(error.message);
  }
};

//==================load add products =================

const loadAddProduct = async (req, res) => {
  try {
  const category = await Category.find()
  res.render("addProduct",{category});
  } catch (error) {
    console.log(error.message);
  }
}

//==================add products===========================

const addProduct = async (req, res) => {
//   const { name, description, price} = req.body;

//   try {
//     const product = new Product({ name, description, price });
//     const check = await Product.find({ name:product.name});
//     if(check!=false) {
//       res.render("addProduct",{message:"Product already exist"})
//     }else{
//     await product.save();
//     res.redirect('/admin/product');
//     }
//   } catch (error) {
//     console.error(error);
//   }
try{
  const data= new Product({
      name:req.body.name,
      description:req.body.description,
      price:req.body.price,
      stock:req.body.Stock,
      category:req.body.selectedCategory,
      //   image:req.files.image,
      // status:0
      
  })
  console.log(req.body);
  console.log(req.files);
  data.images = req.files.map((file) => file.filename);
  const item=await data.save();
  console.log(item);
  if(item){
  res.redirect('/admin/product');
  }
  else{
      console.log("Failed upload");
  }

}
catch(error){
  console.log(error.message);
        }
}

//==============================loadEdit-product================
const loadEditProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    // Render the edit page with product details
    res.render('edit-product', { product });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

//==============================Edit product======================
const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = {
      name: req.body.name,
      description: req.body.description,
      stock: req.body.stock,
      price: req.body.price,
      
    };
    Object.keys(updatedData).forEach((key) => updatedData[key] == "" && delete updatedData[key]);
    // Find and update the product
    // const product = await Product.findByIdAndUpdate(productId, updatedData);
    const product = await Product.updateOne({ _id: productId }, updatedData);
if(product){
    // Redirect to the product list page
    res.redirect('/admin/product');
}
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

//==============================delete product======================

const deleteProduct = async (req, res) => {
  
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    await Product.findByIdAndRemove(productId);
    res.redirect("/admin/product");
  
  
  } catch (error) {
    console.error(error);
  }
};


//=======================list Product=============================
const listProduct = async (req, res) => {
try {
const productId = req.params.id;

const product = await Product.findById(productId);

product.status = 'blocked'
await product.save()

res.redirect("/admin/product");
} catch (error) {

}

}

//====================Unlisted product =================
const unlistproduct = async (req, res)=>{
  try{
   const productId =req.params.id
  const product = await Product.findById(productId);

  product.status = 'active';
  await product.save()


res.redirect("/admin/product");



  }catch (error) {

  }
}

//================================Stock Update =============================
const stockupdate = async (req, res) => {
  try {
    console.log('Stock Update')
    const productId = req.params.id;
    const stock = req.body.stock;

    const updatedData = {
      stock: stock,
    };

    const result = await Product.updateOne({ _id: productId }, updatedData);

    if (result.nModified > 0) {
      res.status(200).json({ message: "Stock updated successfully" });
    } else {
      res
        .status(404)
        .json({ message: "Product not found or stock not updated" });
    }
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  loadProduct,
  loadAddProduct,
  addProduct,
  loadEditProduct,
  editProduct,
  deleteProduct,
  stockupdate,
  listProduct,
  unlistproduct,
};