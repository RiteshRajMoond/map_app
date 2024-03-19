const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

const authRoutes = require('./routes/auth');

app.use(authRoutes);

app.listen(8080 , () => {
    console.log("server started")
});