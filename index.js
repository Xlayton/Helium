require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT;

require('./db/createSchema');

const app = express();

app.listen(PORT);