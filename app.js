const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const authroutes = require("./routes/auth");
const userrotues = require("./routes/user");
const productroutes = require("./routes/products");
const filterroutes = require("./routes/filter");
const orderroutes = require("./routes/orders");
const feedroutes = require("./routes/feed");
const messageroutes=require('./routes/messages')
const bodyparser = require("body-parser");
const { initializeWebSocket } = require("./util/websocket");


require("dotenv").config();
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

initializeWebSocket(server);

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
app.use(orderroutes);
app.use("/feed", feedroutes);
app.use('/messages',messageroutes)

server.listen(process.env.PORT);


