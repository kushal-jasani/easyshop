const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const app = express();
const path = require("path");
const db = require("./util/database");
const authroutes = require("./routes/auth");
const userrotues = require("./routes/user");
const bodyparser = require("body-parser");

require("dotenv").config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ dest: "images/" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(bodyparser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});
app.set("view engine", "ejs");
app.set("views", "views");
app.use(authroutes);

app.post('/upload', upload.single('image'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded');
  }
  res.send('File uploaded successfully');
});

app.use(userrotues);
app.listen(3000);
