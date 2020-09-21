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
// const dataBaseUrl = process.env.DATABASE_URL;
// const client = new pg.Client(dataBaseUrl);
// client.on('error', (err) => {
//   console.err(err);
// });

// middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

// Routes
app.get('/test', homePage);
app.get('/searches/new', searchHandle);


// Route functions
function searchHandle(request, response) {
  const searchQuery = request.body.search[0];
  const searchType = request.body.search[1];
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if(searchType === 'title'){ url += `+intitle:${searchQuery}`}
  if(searchType === 'author'){ url += `+inauthor:${searchQuery}`}
  superagent.get(url)
    .then(bookInfo => {
      const bookArray = bookInfo.body.items;
      const finalBookArray = bookArray.map(book => new Book(book));
      response.render('pages/searches/new.ejs', {finalBookArray: finalBookArray});
    })
}

function homePage(request, response) {
response.status(200).render('pages/index');
}

// Constructor Functions
function Book(book) {
  this.title = book.title;
  this.author = book.author;
  // this.image = book.image;
}
// Server is Listening
// client
//   .connect()
//   .then(startServer)
//   .catch((e) => console.log(e));

// function startServer() {
//   app.listen(PORT, () => {
//     console.log(`Server is ALIVE and listening on port ${PORT}`);
//   });
// }

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})