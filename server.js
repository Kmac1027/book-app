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
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', homePage);
app.get('/searches/new', renderSearchPage);
app.post('/searches', searchHandle);
app.get('*', errorHandler);

// Route functions
function searchHandle(request, response) {
  // console.log(request.body);
  const searchQuery = request.body.search[0];
  const searchType = request.body.search[1];
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (searchType === 'title') { url += `+intitle:${searchQuery}` }
  if (searchType === 'author') { url += `+inauthor:${searchQuery}` }
  superagent.get(url)
    .then(bookInfo => {
      // console.log(bookInfo.body.items[0].volumeInfo.imageLinks);
      const bookArray = bookInfo.body.items;
      const finalBookArray = bookArray.map(book => new Book(book));
      response.render('pages/searches/show.ejs', { finalBookArray: finalBookArray });
    })
    .catch((error) => {
    console.error('error', error);
    response.status(500).send('Unable to process request, please try again.');
  });
}

function renderSearchPage(request, response) {
  response.status(200).render('pages/searches/new.ejs');
}

function homePage(request, response) {
  response.status(200).render('pages/index');
}

// Constructor Functions
function Book(book) {
  this.title = book.volumeInfo.title ? book.volumeInfo.title : 'book not found';
  this.author = book.volumeInfo.authors ? book.volumeInfo.authors : 'author not found';
  this.description = book.volumeInfo.description;
  this.image = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://i.imgur.com/J5LVHEL.jpg";
}

function errorHandler(request, respond) {
  respond.status(404).send('Unable to process request, please try again.');
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