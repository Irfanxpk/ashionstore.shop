const express = require("express");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bodyParser = require('body-parser');  
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session');
require("dotenv").config();
// const noCache = require('nocache');
const crypto = require('crypto');

app.use((req, res, next) => {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

//=============================================declaring port
let port = process.env.PORT||8080;



app.set('view engine', 'ejs');
app.set('views','./views/user');


//=============================================Middleware configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"), { maxAge: 3600000 }));
// app.use(nocache());


app.use(session({
    secret:crypto.randomBytes(64).toString('hex'),   
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}))



//=============================================Routes
// app.use(noCache());
app.use("/", userRoutes);
app.use('/admin',adminRoutes);

app.get('*',(req,res)=>{
    res.status(404).render('404')
})









//=============================================database connecting
mongoose
  .connect(
    "mongodb+srv://pkirfanx:6wg7v5wjLNwZw58P@cluster0.rqdal7l.mongodb.net/cluster0?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch(() => {
    console.log("Failed to connect");
  });





//============================================Listening to the app
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
