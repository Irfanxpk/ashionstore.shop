const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController")
const auth = require("../middlewares/userAuth");
const cartController = require("../controllers/cartController")
const orderController = require("../controllers/orderController")
const addressController = require("../controllers/addressController")

router.get('/',auth.isLogout,userController.home)
router.get('/login',userController.login)
router.post('/login',userController.loginvalid)
// router.get('/logout',userController.logout)
router.get('/register',userController.SignUp)
router.post('/register',userController.insertUser)
router.get("/verify-otp", userController.validotp);
router.post("/resend-otp", userController.resendOtp);
router.get('/logout',userController.Logout);
router.get('/product/:id',userController.productPage);
router.get('/cart',cartController.loadCart);
router.get('/addtoCart/:id',cartController.addtocart);
router.post('/updateProductQuantity',cartController.ProductCount);
router.post('/deleteCartItems',cartController.deleteCartItems);
router.get('/checkout',cartController.loadChekout);


router.get('/shop',userController.loadshop);


router.get('/userprofile',userController.userinfo);    
router.post("/edit/:id", userController.updateUser);
router.post("/updateUser", userController.updateUser);


//=========Address Routes=============
router.post('/addAddress' , addressController.addNewAddress);
router.get('/editAddress/:id',addressController.editAddress)
router.post("/EditAddress/:id", addressController.updateAddress);
router.get('/deleteAddress/:id',addressController.deleteAddress);


//===order Routes================================
router.post('/placeorder',orderController.placeOrder)
router.post("/create-order", orderController.createOrder);
router.post("/verify-payment", orderController.verifypayment);
router.get('/orderSuccess',orderController.orderSuccess)
router.post("/cancelOrder/:id", orderController.cancelOrder);
router.get("/orderDetails/:id", orderController.singleOrderDetails);
router.get("/invoice/:id", orderController.downloadInvoice);

//===========Wallet Routes======================
router.post("/addAmount" , userController.addAmount);

router.get("/search" , userController.search);
router.post('/filter',userController.filter)
router.get("/filter-category/:category", userController.filterCategory);
// router.get("/orderDetails/:id", userController.orderDetails);
// router.post('/Register',userController.createUser)


module.exports=router;