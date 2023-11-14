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
// const authmult = require('../middlewares/multer')

//===========================SESSION SETTING================================================
adminRoute.use(session({
  resave: true,
  saveUninitialized: true,
  secret: crypto.randomBytes(64).toString('hex')
}));

//============================setting multer===============================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/product");
  },
  filename: function (req, file, cb) {
    // cb(null, Date.now() + '-' + file.originalname);
    cb(null,file.fieldname + "-" + Date.now() + path.extname(file.originalname))
  },
});

const upload = multer({ storage: storage });

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
adminRoute.post('/addProduct', upload.array('images',6), productController.addProduct);
adminRoute.get('/edit-product/:id', productController.loadEditProduct);
adminRoute.post('/edit-product/:id',productController.editProduct);
adminRoute.get('/delete-product/:id', productController.deleteProduct);
adminRoute.get('/listProduct/:id', productController.listProduct);
adminRoute.get('/unlistProduct/:id', productController.unlistproduct)
adminRoute.get("/orders", adminController.orders);
adminRoute.post("/changeOrderStatus/:id", adminController.changeOrderStatus);
// adminRoute.patch("/products/stock/:id", productController.stockupdate);
// module.exports = router;
module.exports = adminRoute;