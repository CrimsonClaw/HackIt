require('../app.js');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');

const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const User = mongoose.model('Users');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.engine('hbs', exphbs({ extname: 'hbs', handlebars: allowInsecurePrototypeAccess(Handlebars), helpers:{
    // Function to do basic mathematical operation in handlebar
    math: function(lvalue, operator, rvalue) {lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    }
} }));

app.set('view engine', 'hbs');

var test = require('../middleware/testSController');

app.use('/viewTest',ensureAuthenticated, test.testAvail);

app.get('/:title',ensureAuthenticated, test.paginatedResults);

app.get('/', ensureAuthenticated, (req, res) => {
    User.find({email: req.user.email}, (err,docs)=>{
        if(docs[0].role=='student' || docs[0].role=='admin'){
            res.render('student.hbs', {user: docs[0],  message: req.flash('message'), layout: false});
        }
        else{
          res.redirect('/faculty');
          }
    });
})

var sf = require('../middleware/sfController');
app.post('/update', ensureAuthenticated, sf.update);

module.exports = app;