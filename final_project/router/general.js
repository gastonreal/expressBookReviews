const express = require('express');
let books = require("./booksdb.js");
const { fileURLToPath } = require('url');
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
  res.json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  
  const isbn = req.params.isbn;
  const book = books[isbn];
  if ( book ) {
    res.json(book);
  }
  else {
    res.status(404).json({message: 'Book not found'});
  }


 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  const found = Object.entries(books).map( ( [k,v] ) => v ).filter( (v) => author === v.author );

  if ( found.length > 0 ) {
    res.json(found[0]);
  } else {
    res.status(404).json({message: "Book not found"});
  }
  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  const found = Object.entries(books).map( ( [k,v] ) => v ).filter( (v) => title === v.title );

  if ( found.length > 0 ) {
    res.json(found[0]);
  } else {
    res.status(404).json({message: "Book not found"});
  }
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
