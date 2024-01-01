const Admin = require("../models/adminModel");
const Category = require("../models/category");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

//=================load products =============================

const loadProduct = async (req, res) => {
  try {
    const product = await Product.find();
    res.render("product", { product });
  } catch (error) {
    console.log(error.message);
  }
};

//==================load add products =================

const loadAddProduct = async (req, res) => {
  try {
    const category = await Category.find();
    res.render("addProduct", { category });
  } catch (error) {
    console.log(error.message);
  }
};

//==================add products===========================

const addProduct = async (req, res) => {
    
  try {
    console.log("on addProduct");
    const { productOffer, validFrom, validUntil, productDiscount } = req.body;
    const data = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.Stock,
      category: req.body.selectedCategory,
      //   image:req.files.image,
      // status:0
    });
    data.images = req.files.map((file) => file.filename);

    if (productOffer) {
      data.productOffer = {
        discount: productDiscount,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
      };
    }

    const item = await data.save();

    for (const file of req.files) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("Original file deleted:", file.path);
        }
      });
    }

    

    console.log(item);
    if (item) {
      res.redirect("/admin/product");
    } else {
      console.log("Failed upload");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//==============================loadEdit-product================
const loadEditProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    // Render the edit page with product details
    res.render("edit-product", { product });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const updateimg = async (req, res) => {
  try {
    console.log(req.files);
    const { img, index, id } = req.body;

    const imagePath = path.join("public", "uploads", "product_resized", img); // Adjust the path accordingly
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting image:", err);
        return;
      }
      console.log("Image deleted successfully");
    });

    const product = await Product.findById(id);

    if (product) {
      product.images[index] = req.files[0].filename;

      await product.save();

      res.json({ message: "Image updated successfully", index });
    } else {
      res.send("Product not found");
    }
  } catch (err) {
    console.error("Error updating image:", err);
    res.status(500).json({ error: "Error updating image" });
  }
};

// ==========================delete=single=image===============

const deleteimg = async (req, res) => {
  try {
    const { img, index, id } = req.body;

    console.log(req.body);

    const imagePath = path.join("public", "uploads", "product_resized", img); // Adjust the path accordingly
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting image:", err);
        return;
      }
      console.log("Image deleted successfully");
    });
    const product = await Product.findById(id);
    if (product) {
      product.images.splice(index, 1);
      await product.save();
      res.json({ message: "Image deleted successfully", index });
    } else {
      res.send("Product not found");
    }
  } catch (err) {
    console.log(err);
  }
};

//=======================upload img ======================
const uploadimg = async (req, res) => {
  try {
    if (req.files) {
      const file = req.files;
      console.log(req.body, req.files[0].filename);
      const id = req.body.id;
      const product = await Product.findById(id);
      if (product) {
        product.images.push(file[0].filename);
        await product.save();
        res.json({ message: "Image uploaded successfully" });
      } else {
        res.json({ message: "Product not found" });
      }
    } else {
      res.json({ message: "No image uploaded" });
    }
  } catch (err) {
    console.log(err);
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
    Object.keys(updatedData).forEach(
      (key) => updatedData[key] == "" && delete updatedData[key]
    );
    // Find and update the product
    // const product = await Product.findByIdAndUpdate(productId, updatedData);
    const product = await Product.updateOne({ _id: productId }, updatedData);
    if (product) {
      // Redirect to the product list page
      res.redirect("/admin/product");
    }
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//==============================Cropimage======================
const sharp = require("sharp");
const cropimage = async (req, res) => {
  try {
    const outputDir = "public/uploads/product_resized"; // Directory for processed images
    const outputPath = path.join(outputDir, req.file.filename);
    const old = path.join(outputDir, req.body.imageName);

    await fs.unlink(old, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("Original file deleted:", req.file.path);
      }
    });
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await sharp(req.file.path)
      .resize({ width: 270, height: 360 })
      .toFile(outputPath);

    await fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("Original file deleted:", req.file.path);
      }
    });

    const { id, index } = req.body;
    const product = await Product.findById(id);

    product.images[index] = req.file.filename;

    await product.save();

    res.status(200).send("Image uploaded successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//==============================delete product======================

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
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

    product.status = "blocked";
    await product.save();

    res.redirect("/admin/product");
  } catch (error) {}
};

//====================Unlisted product =================
const unlistproduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    product.status = "active";
    await product.save();

    res.redirect("/admin/product");
  } catch (error) {}
};

//================================Stock Update =============================
const stockupdate = async (req, res) => {
  try {
    console.log("Stock Update");
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

const productoffers = async (req, res) => {
  try {
    console.log( req.params.id );  
    const product = await Product.findById(req.params.id);

    console.log(product);

    res.render('offer' , {product})
  
  } catch (error) {
    console.log(error.message);
  }
}

const productoffersedit = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const { discount, validFrom, validUntil } = req.body;
    product.productOffer.discount = discount;
    product.productOffer.validFrom = validFrom;
    product.productOffer.validUntil = validUntil;
    await product.save();
    console.log(req.body, req.params.id);
    res.redirect('/admin/product');
  } catch (error) {
    console.log(error.message);
  }
}



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
  cropimage,
  updateimg,
  deleteimg,
  uploadimg,
  productoffers,
  productoffersedit,
};
