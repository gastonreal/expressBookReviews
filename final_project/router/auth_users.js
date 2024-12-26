const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const TOKEN_SECRET = 'token_secret'

let users = [];

const register = (userName, password ) => {
  users.push({userName: userName, password: password});
}

const isValid = (username)=>{ //returns boolean

  return users.filter( (user) => user.userName === username ).length == 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean

  return users.filter( (user)=> user.userName === username && user.password === password ).length > 0;
}

const isLoggedIn = (session) => {

  return new Promise( (resolve, reject) => {

    if ( session.authorization) {

      const token = session.authorization['token'];
  
      jwt.verify( token, TOKEN_SECRET, (error, payload ) => {    
          if ( error ) {
              reject(error);
          }
  
          resolve(payload.userName)
      } );
  
    } else {
        reject(new Error("User not logged in"));
    }
  })

  
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;

  if ( !username || !password) {
    res.status(400).json({message: "Bad Request"});
    return;
  }

  if ( !authenticatedUser(username, password) ) {
    res.status(401).json({message: "Invalid user"});
    return;
  }

  const theToken = jwt.sign( {userName: username}, TOKEN_SECRET);

  req.session.authorization = { token: theToken };

  res.json({message: "Login OK"});

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  const reviewText = req.query.review;
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!reviewText ) {
    res.status(400).json({message: 'Bad Request'});
    return;
  }

  if (!book ) {
    res.status(404).json({message: 'Book not found'});
    return;
  }

  book.reviews[req.user] = reviewText;
  
  res.json({message: `Review for book with ISBN ${isbn} for user ${req.user} was added`});

});

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book ) {
    res.status(404).json({message: 'Book not found'});
    return;
  }

  delete book.reviews[req.user];

  res.json({message: `Review for book with ISBN ${isbn} for user ${req.user} was deleted`});
});


module.exports.register = register;
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.isLoggedIn = isLoggedIn;
