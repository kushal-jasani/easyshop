const express = require("express");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const app = express();
const authroutes = require("./routes/auth");
const userrotues = require("./routes/user");
const productroutes = require("./routes/products");
const filterroutes=require('./routes/filter')

const bodyparser = require("body-parser");

require("dotenv").config();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "easyshop",
    allowed_formats: ["jpg", "jpeg", "png",'avif','webp'],
  },
});

app.use(
  multer({ storage: storage }).fields([
    { name: "aadharphoto", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ])
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use("/auth", authroutes);

app.use(userrotues);
app.use(productroutes);
app.use(filterroutes);
app.listen(process.env.PORT);
