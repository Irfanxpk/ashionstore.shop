const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: String,
  description:String,
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active', // Set the default status to "active"
    
  },
  
  isDeleted :{type : 'boolean', default: false} ,
  
});   

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;