const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const isLoggedIn = require('./router/auth_users.js').isLoggedIn;
const genl_routes = require('./router/general.js').general;


const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){

    isLoggedIn(req.session)
        .then( (userName) => {             
            req.user = userName; 
            next(); 
        })
        .catch((error) => res.status(403).json({ message: error.message }) );
});
 
const PORT =8080;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
