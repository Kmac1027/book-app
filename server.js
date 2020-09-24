'use strict';

require('dotenv').config();
require('ejs');

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

const app = express();

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => {
  console.log(error);
});

let port = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));

// Routes
app.get('/', renderHomePage);
app.get('/search', renderSearchForm);
app.post('/searches', getBookData);
app.post('/books', addBookToDatabase);
app.get('/books/:book_id', singleBookDetails);
app.put('/update/:book_id', updateBook);
app.delete('/delete/:book_id', deleteBook);
app.get(`*`, handleError);

function renderHomePage(request, response) {
  const sql = 'SELECT * FROM books;';
  return client.query(sql)
    .then(results => {
      // console.log(results.rows);
      let myBooks = results.rows;
      response.status(200).render('pages/index', {renderedContent: myBooks});
  })
  .catch(error => {
    console.log(error)
    response.render('pages/error');
  })
}

function renderSearchForm(request, response) {
  response.status(200).render('pages/searches/new.ejs');
}

function getBookData (request, response) {
  const searchQuery = request.body.search[0];
  const searchType = request.body.search[1];

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if(searchType === 'title'){ url += `+intitle:${searchQuery}`}
  if(searchType === 'author'){ url += `+inauthor:${searchQuery}`}
  
  superagent.get(url)
    .then(data => {
      const bookArray = data.body.items;
      const finalBookArray = bookArray.map(book => new Book(book.volumeInfo));
      response.render('pages/searches/show', {finalBookArray: finalBookArray});
    })
    .catch(error => {
      console.log(error);
      response.render('pages/error');
    })
}

function handleError (request, response) {
  response.status(404).render('error');
} 

function addBookToDatabase(request, response) {
  const {author, title, isbn, image_url, description} = request.body;
  const sql = 'INSERT INTO books (author, title, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING id;';
  const safeValues = [author, title, isbn, image_url, description];
  client.query(sql, safeValues)
    .then((idFromSQL) => {
      // console.log(idFromSQL);
      response.redirect(`books/${idFromSQL.rows[0].id}`)
    }).catch((error) => {
      console.log(error);
      response.render('pages/error');
    });
}

function singleBookDetails(request, response) {
  const id = request.params.book_id;
  // console.log('in the get one book', id);
  const sql = 'SELECT * FROM books WHERE id=$1;';
  const safeValues = [id];
  client.query(sql, safeValues)
  .then((results) => {
    // console.log(results);
    const myChosenBook = results.rows[0];
    response.render('pages/books/detail', { myChosenBook: myChosenBook });
  });
}

function updateBook(request, response) {
  const id = request.params.book_id;
  const {author, title, isbn, image_url, description} = request.body;

  let sql = 'UPDATE books SET author=$1, title=$2, isbn=$3, image_url=$4, description=$5 WHERE id=$6;';
  let safeValues = [author, title, isbn, image_url, description, id];
  client.query(sql, safeValues);
  response.status(200).redirect(`/books/${id}`);
}

function deleteBook(request, response) {
  const id = request.params.book_id;

  let sql = 'DELETE FROM books WHERE id=$1;';
  let safeValues = [id];
  client.query(sql, safeValues);
  response.status(200).redirect('/');
}

// Constructor Functions
function Book(volumeInfo) {
  this.image_url = volumeInfo.imageLinks ? volumeInfo.imageLinks.smallThumbnail.replace(/^http:\/\//i, 'https://'): `https://i.imgur.com/J5LVHEL.jpg`;
  this.title = volumeInfo.title ? volumeInfo.title: ` Title Unavailable!`;
  this.author = volumeInfo.authors ? volumeInfo.authors[0]: `Author Unavailable!`;
  this.description = volumeInfo.description ? volumeInfo.description: `Description Not Found!?`;
  this.isbn = volumeInfo.industryIdentifiers[0].identifier ? volumeInfo.industryIdentifiers[0].identifier: `No number available`;
}

client.connect()
  .then(() => {
    app.listen(port, () => {
      console.log('Server is listening on port', port);
    });
  })








