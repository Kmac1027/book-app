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

// middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

// Routes
app.get('/test', homePage);
app.get('/searches/new', searchHandle);


// Route functions
function searchHandle(request, response) {
  (console.log('hello searchHandle'));
}

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