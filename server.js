"use strict";

//dependencies
require("dotenv").config();
const cors = require("cors");
const PORT = process.env.PORT;
const express = require("express");
const app = express();
app.use(cors());
const superagent = require("superagent");
let pg = require("pg");
const { response } = require("express");
const dataBaseUrl = process.env.DATABASE_URL;
const client = new pg.Client(dataBaseUrl);
client.on('error', (err) => {
  console.err(err);
});
// tells express to looks for a 'views' folder
app.set('view engine', 'ejs');

// middleware
app.set('view engine', 'ejs');
app.use(express.static('./public/styles'));
app.use(express.urlencoded({extended:true}));

// Routes
app.get('/', homePage);


// Route functions

function homePage(request, response) {
response.status(200).render('pages/index');
}




// Server is Listening
client
  .connect()
  .then(startServer)
  .catch((e) => console.log(e));

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is ALIVE and listening on port ${PORT}`);
  });
}