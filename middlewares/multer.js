const multer = require('multer');
const _ = require('../models/Product');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads'); // Define the path where uploaded images will be stored
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    },
  });
  // const upload = multer({ storage });
  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb('Only image files are allowed!', false);
      }
    },
  });

//   const productImgupload=upload.arr
  
  const addProduct = [
    upload.array('images', 4), async (req, res) => {
      const { name, description, price } = req.body;
      const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    
      const newProduct = new Product({
        name,
        description,
        price,
        images: imageUrls,
      });
    
      await newProduct.save();
    
      res.redirect('/admin/products');
    }];

module.exports = {addProduct};