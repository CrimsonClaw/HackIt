require('../app.js');
require('../models/Form');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Handlebars = require('handlebars')
const exphbs = require('express-handlebars');
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');

const test = mongoose.model('Testdetail');

var app = express();
const User = mongoose.model('Users');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'facultyLayout', layoutsDir: 'views/layouts/', handlebars: allowInsecurePrototypeAccess(Handlebars) }));
app.set('view engine', 'hbs');

app.get('/', ensureAuthenticated, (req, res) => {
    User.find({email: req.user.email}, (err,docs) => {
        if(docs[0].role=='faculty' || docs[0].role=='admin'){
            test.find({'status': 'active'}).exec((err, tests) => {
                test.find({'status': 'completed'}).exec((err, testsC) => {
                    res.render('faculty/home.hbs', {user: docs[0], test: tests, testC: testsC});
                });
            });
        }
        else{
            res.redirect('/student');
        }
    })
});

app.get('/profile', ensureAuthenticated, (req, res) => {
    User.find({email: req.user.email}, (err, docs) => {
        res.render('faculty/profile.hbs', {user: docs[0], message: req.flash('message')});
    });
});

var sf = require('../middleware/sfController');
app.post('/profile/update', ensureAuthenticated, sf.update);

app.get('/createTest', ensureAuthenticated, (req, res) => {
    User.find({email: req.user.email}, (err,docs) => {
        res.render('createTest.hbs', {user: docs[0], layout: false});
    });
});

var form = require('../middleware/testFController');
app.post('/create', ensureAuthenticated, form.create);

app.post('/created', (req, res) => {
    res.redirect('/faculty');
});

app.post('/:title/update', ensureAuthenticated, form.update);

app.get('/:title/view', ensureAuthenticated, form.view);

app.post('/:title/cancel', ensureAuthenticated, form.delete);

var uploads = require('../middleware/uploadController');

app.get('/viewTest', ensureAuthenticated, uploads.testAvail);

app.get('/:title', ensureAuthenticated, uploads.loadHome);

app.post('/uploadTest/upload', ensureAuthenticated, uploads.uploadFile);

app.get('/:title/viewFiles', ensureAuthenticated, uploads.viewTest);

app.post('/del/:_id', ensureAuthenticated, uploads.delete);

module.exports = app;