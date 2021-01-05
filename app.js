require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//MongoDB local connection
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});

// log error or successful connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected to MongoDB");
});

// create mongoose schema for Secrets site
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

//encrypt the password only
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });

// create mongoose model
const User = new mongoose.model('User', userSchema);

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});


app.post("/register", function(req, res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

newUser.save(function(err){
  if (err) {
    console.log(err);
   } else {
    res.render("secrets")
   }
  });
});


app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

User.findOne({email: username}, function(err, foundUser){
  if (err) {
    console.log(err);
  } else {
    if (foundUser) {
      if (foundUser.password === password) {
        res.render("secrets");
      }
    }
   }
  });
});





// Listen for cloud service port else use local port 3000
 let port = process.env.PORT;
 if (port == null || port == "") {
  port = 3000;
 }

app.listen(port, function() {
  console.log("Server started successfully");
});
