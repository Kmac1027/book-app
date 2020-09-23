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
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => {
  console.log(error);
});

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
  const sql = 'SELECT * FROM books;';
  return client.query(sql)
    .then(results => {
      // console.log(results.rows);
      let myBooks = results.rows;
      response.status(200).render('pages/index', {renderedBooks: myBooks});
  })
  .catch(error =>{
    console.log(error)
    response.render('pages/error');
  })
}

// Constructor Functions
function Book(book) {
  this.title = book.volumeInfo.title ? book.volumeInfo.title : 'book not found';
  this.author = book.volumeInfo.authors ? book.volumeInfo.authors : 'author not found';
  this.description = book.volumeInfo.description;
  book.imageLinks !== undefined ? this.image = book.imageLinks.thumbnail.replace('http:', 'https:') : this.image = 'https://i.imgur.com/J5LVHEL.jpg';
  // this.image = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://i.imgur.com/J5LVHEL.jpg";
    }

function errorHandler(request, respond) {
  respond.status(404).send('Unable to process request, please try again.');
}

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
  })

// app.listen(PORT, () => {
//   console.log(`listening on ${PORT}`);
// })