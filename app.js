const express = require("express");
const app = express();
const path = require("path");
const db = require("./util/database");
const authroutes = require("./routes/auth");
const userrotues = require("./routes/user");
const bodyparser = require("body-parser");

require("dotenv").config();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});
app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyparser.json());
app.use(authroutes);
app.use(userrotues);
app.listen(3000);
