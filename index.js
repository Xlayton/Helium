require("dotenv").config();
const path = require('path');
const express = require("express");
const PORT = process.env.PORT;

const app = express();
app.use(express.static(path.join(__dirname+'/public')));

app.listen(PORT);