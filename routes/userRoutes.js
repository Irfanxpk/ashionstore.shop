const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController")
const auth = require("../middlewares/userAuth");
const cartController = require("../controllers/cartController")
const orderController = require("../controllers/orderController")
const addressController = require("../controllers/addressController")

router.get('/',auth.isLogin,userController.home)
router.get('/login',userController.login)
router.post('/login',userController.loginvalid)
// router.get('/logout',userController.logout)
router.get('/register',userController.SignUp)
router.post('/register',userController.insertUser)
router.get("/verify-otp", userController.validotp);
router.post("/resend-otp", userController.resendOtp);
router.get('/logout',userController.Logout);

router.get("/product/:id", auth.isLogin,userController.productPage);
router.get('/cart',auth.isLogin,cartController.loadCart);
router.get('/addtoCart/:id',auth.isLogin,cartController.addtocart);
router.post('/updateProductQuantity',cartController.ProductCount);
router.post('/deleteCartItems',cartController.deleteCartItems);
router.get('/checkout',auth.isLogin,cartController.loadChekout);
router.get("/verify-discount",cartController.verifyDiscount);


router.get('/shop',auth.isLogin,userController.loadshop);


router.get('/userprofile',auth.isLogin,userController.userinfo);    
router.post("/edit/:id",auth.isLogin,userController.updateUser);
router.post("/updateUser",auth.isLogin, userController.updateUser);


//=========Address Routes=============
router.post('/addAddress' , auth.isLogin,addressController.addNewAddress);
router.get('/editAddress/:id',auth.isLogin,addressController.editAddress)
router.post("/EditAddress/:id",auth.isLogin, addressController.updateAddress);
router.get('/deleteAddress/:id',auth.isLogin,addressController.deleteAddress);


//===order Routes================================
router.post('/placeorder',auth.isLogin,orderController.placeOrder)
router.post("/create-order",auth.isLogin, orderController.createOrder);
router.post("/verify-payment",auth.isLogin, orderController.verifypayment);
router.get('/orderSuccess',auth.isLogin,orderController.orderSuccess)
router.post("/cancelOrder/:id",auth.isLogin, orderController.cancelOrder);
router.get("/orderDetails/:id",auth.isLogin, orderController.singleOrderDetails);
router.get("/invoice/:id",auth.isLogin, orderController.downloadInvoice);

//===========Wallet Routes======================
router.post("/addAmount" , userController.addAmount);

router.get("/search" ,auth.isLogin, userController.search);
router.post('/filter',auth.isLogin,userController.filter)
router.get("/filter-category/:category",auth.isLogin, userController.filterCategory);

module.exports=router;