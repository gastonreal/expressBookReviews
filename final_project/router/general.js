const express = require('express');
let books = require("./booksdb.js");
const { fileURLToPath } = require('url');
const { resolve } = require('path');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let registerUser = require("./auth_users.js").register;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  
  const {username, password} = req.body;

  if ( !username || !password ) {
    res.status(400).json({message: 'Bad Request'});
    return;
  }

  if (!isValid(username)) {
    res.status(400).json({message: 'User already exists'});
    return;
  }

  registerUser( username, password);
  
  return res.status(200).json({message: "User successfully registered"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {

  // alternative implementation with a Promise (doesn't make a lot of sense though)
  new Promise( (resolve, reject) => {
    resolve(books);
  }).then( (books)=> res.json(books) );
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {

  // alternative implementation with a Promise
  new Promise( (resolve, reject) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if ( book ) {
      resolve(book);
    }
    else {
      reject( new Error('Book not found'));
  }
  }).then( (book)=> res.json(book) )
    .catch( (error) => res.status(404).json({message: error.message}) );
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {

  // alternative implementation with Promise
  new Promise( ( resolve, reject )=> {
    const author = req.params.author;

    const found = Object.entries(books).map( ( [k,v] ) => v ).filter( (v) => author === v.author );

    if ( found.length > 0 ) {
      resolve(found[0]);
    } else {
      reject( new Error( "Book not found"));
    }

  }).then( (book)=> res.json(book) )
  .catch( (error) => res.status(404).json({message: error.message}) );
  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {

  // alternative implementation with Promise
  new Promise( (resolve, reject) => {

    const title = req.params.title;

    const found = Object.entries(books).map( ( [k,v] ) => v ).filter( (v) => title === v.title );

    if ( found.length > 0 ) {
      resolve(found[0]);
    } else {
      reject( new Error( "Book not found"));
    }

  }).then( (book)=> res.json(book) )
  .catch( (error) => res.status(404).json({message: error.message}) );
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if ( book ) {
    res.json(book.reviews);
  }
  else {
    res.status(404).json({message: 'Book not found'});
  }
});

module.exports.general = public_users;
