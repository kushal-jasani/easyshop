const express = require("express");
const app = express();
const authroutes = require("./routes/auth");
const userrotues = require("./routes/user");
const productroutes = require("./routes/products");
const filterroutes=require('./routes/filter')
const orderroutes=require('./routes/orders')
const bodyparser = require("body-parser");

require("dotenv").config();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());


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
app.use(orderroutes)
app.listen(process.env.PORT);
