const User = require('../models/User')
const Product = require("../models/Product");

const isLogin = async (req,res,next)=>{
    try {
        
        if(req.session.user_id){
            const blockedUser = await User.findOne({ _id: req.session.user_id });
            if(blockedUser.status === 'active'){
                next()
            }else{
                
                req.session.user_id = false;
                req.session.name = false;
                res.redirect('/')
            }
        }else{
            next();
        }
      

    } catch (error) {
        console.log(error);
    }
}

const isLogout = async (req,res,next)=>{
    try {
        
        if(req.session.user_id){

            const isLoggedIn = true
            const products = await Product.find({ status: "active" });
            res.render("index", { isLoggedIn, products });
        }else{
             const isLoggedIn = false;
             const products = await Product.find({ status: "active" });
             res.render("index", { isLoggedIn, products });
            
        }
        

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    isLogin,
    isLogout
}