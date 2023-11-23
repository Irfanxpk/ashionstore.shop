const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController")
const auth = require("../middlewares/userAuth");
const cartController = require("../controllers/cartController")

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
router.post('/addAddress' , userController.addNewAddress);
router.get('/editAddress/:id',userController.editAddress)
router.post("/EditAddress/:id", userController.updateAddress);
router.get('/deleteAddress/:id',userController.deleteAddress);
router.post("/updateUser", userController.updateUser);
router.post('/placeorder',userController.placeOrder)
router.post("/create-order", userController.createOrder);
router.post("/verify-payment", userController.verifypayment);
router.get('/orderSuccess',userController.orderSuccess)
router.get("/search" , userController.search);
router.post('/filter',userController.filter)
router.get("/filter-category/:category", userController.filterCategory);
router.get("/cancelOrder/:id", userController.cancelOrder);
router.get("/orderDetails/:id", userController.singleOrderDetails);
// router.get("/orderDetails/:id", userController.orderDetails);
// router.post('/Register',userController.createUser)


module.exports=router;