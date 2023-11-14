const isLogin = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            next()
        }else{
          
            res.render('signin')
        }
        
    } catch (error) {
        console.log(error);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/admin/index')
        }else{
            next()
        }
        
    } catch (error) {
        console.log(error);
    }
}

 module.exports ={
     isLogin,isLogout
 }