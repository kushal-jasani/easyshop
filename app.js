const express = require("express");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const app = express();
const path = require("path");
const db = require("./util/database");
const authroutes = require("./routes/auth");
const userrotues = require("./routes/user");
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
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
app.use(multer({ storage: storage }).single("image"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use('/auth',authroutes);

app.use(userrotues);
app.listen(process.env.PORT);
