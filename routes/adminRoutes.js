const express = require('express')
const adminRoute = express()
const router = express.Router();
const adminController = require('../controllers/adminController')
const productController = require('../controllers/productController')
const path = require('path')
const session = require('express-session')
const auth = require('../middlewares/adminAuth')
const multer = require('multer')
const crypto = require('crypto');
const bodyParser = require('body-parser');
const sharp = require('sharp');
const fs = require('fs');
// const authmult = require('../middlewares/multer')

//===========================SESSION SETTING================================================
adminRoute.use(session({
  resave: true,
  saveUninitialized: true,
  secret: crypto.randomBytes(64).toString('hex')
}));


// //============================setting multer===============================================
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads/product");
//   },
//   filename: function (req, file, cb) {
//     // cb(null, Date.now() + '-' + file.originalname);
//     cb(null,file.fieldname + "-" + Date.now() + path.extname(file.originalname))
//   },
// });

// const upload = multer({ storage: storage ,
// limits :{
//   fileSize: 50 * 1024 * 1024
// },
// fileFilter: function (req, file, cb) {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb('Only image files are allowed!', false);
//   }
// },
// });




// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/product");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
  },
});

const upload = multer({
  storage: storage,
  
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb('Only image files are allowed!', false);
    }
  }
  
});

// Middleware to process uploaded images using Sharp after Multer
const resizeAndSave = async (req, res, next) => {
  try {
    if (!req.files || !req.files.length) {
      return next();
    }

    const processedImages = [];

    for (const file of req.files) {
      const outputDir = 'public/uploads/product_resized'; // Directory for processed images
      const outputPath = path.join(outputDir, file.filename);

      // Create the output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });   
      }

      await sharp(file.path)
        .resize({ width: 270, height: 360 })
        .toFile(outputPath);
    processedImages.push(outputPath); // Store the processed image paths
    
    await fs.unlink(file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("Original file deleted:", file.path);
      }
    });

    }
    req.processedImages = processedImages;
   
    next();
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).send('Error processing images');
  }
};






//===========================BODY PARSING===================================================
adminRoute.use(express.json())
adminRoute.use(express.urlencoded({ extended: true }))

//==============================SETTING VIEW ENGINE=========================================
adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin')
adminRoute.use('/uploads', express.static('public/uploads'));


// adminRoute.get('/', auth.isLogout,adminController.loadLogin)
// adminRoute.get('/home', auth.isLogin,adminController.loadAdmin)
// adminRoute.post('/adminLogin', auth.isLogout, adminController.adminLogin)
adminRoute.get('/',auth.isLogout, adminController.loadAdmin);
adminRoute.post('/Dash', adminController.adminLogin);
adminRoute.get('/index',auth.isLogin, adminController.loadDash);
adminRoute.get('/logout',adminController.adminLogout)
adminRoute.post('/block/:userId', adminController.blockUser);
adminRoute.get("/UserManage",adminController.UserManage);
adminRoute.post('/unblock/:userId', adminController.unblockUser);
adminRoute.get('/category', adminController.loadCategory);
adminRoute.get('/addCategory', adminController.loadAddCat);
adminRoute.post('/addCategory', adminController.addCategory)
adminRoute.get('/edit/:id', adminController.loadEdit);
adminRoute.post('/edit/:id', adminController.updateCategory);
adminRoute.get('/categories/:categoryId/remove', adminController.categoryRemove);
adminRoute.get('/categories/:categoryId/block', adminController.categoryBlock)
adminRoute.get('/categories/:categoryId/unblock', adminController.categoryUnblock)
adminRoute.get('/product',productController.loadProduct)
adminRoute.get('/addProduct',productController.loadAddProduct);
adminRoute.post('/addProduct', upload.array('images',6), resizeAndSave, productController.addProduct);
adminRoute.get('/edit-product/:id', productController.loadEditProduct);
adminRoute.post("/updateimg", upload.array('images',1),resizeAndSave , productController.updateimg);
adminRoute.post("/deleteimg" , productController.deleteimg);
adminRoute.post("/uploadimg", upload.array('images',1),resizeAndSave , productController.uploadimg);
adminRoute.post('/uploadCroppedImage', upload.single('images'),  productController.cropimage);
adminRoute.post('/edit-product/:id',productController.editProduct);
adminRoute.get('/delete-product/:id', productController.deleteProduct);
adminRoute.get('/listProduct/:id', productController.listProduct);
adminRoute.get('/unlistProduct/:id', productController.unlistproduct)
adminRoute.post("/productoffers/:id", productController.productoffers);
adminRoute.get("/orders", adminController.orders);
adminRoute.post("/changeOrderStatus/:id", adminController.changeOrderStatus);
adminRoute.get('/sales', adminController.sales)
adminRoute.get("/salesdate", adminController.filterByDate);
adminRoute.get('/SalesReport', adminController.SalesReport);

// adminRoute.get("/Sales/exel", adminController.exel);
// adminRoute.patch("/products/stock/:id", productController.stockupdate);
// module.exports = router;
module.exports = adminRoute;