require('../models/Form');
require('../models/TestCase');

const MongoClient = require('mongodb');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage')
const mongoose = require('mongoose');

const url = "mongodb+srv://mongo:mongo@cluster0-4zn27.mongodb.net/test?retryWrites=true&w=majority";
const dbName = "test";

const test= mongoose.model('Testdetail');
const testcase = mongoose.model('Testcase');

let storage = new GridFsStorage({
  url: url,
  file: (req, file) => {
    return {
      bucketName: 'uploads',       //Setting collection name, default name is fs
      filename: file.originalname     //Setting file name to original name of file
    }
  }
});

let upload = null;

storage.on('connection', (db) => {
  //Setting up upload for a single file
  upload = multer({
    storage: storage
  }).single('file1');
  
});

module.exports.getResults = (req, res) => {
    let Title;
    let questions;
    
    let role = req.user.role;

    test.findOne({'title': `${req.params.title}`}).exec((err, docs) => {
      Title = docs.title;
      questions = docs.question;
    });
    
    MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true}, function(err, client){
  
    if(err){
        return res.render('result.hbs', {title: Title, message: 'MongoClient Connection error', layout: false});
    }
    const db = client.db(dbName);
    
    const col = db.collection(Title);
    const collection = db.collection('uploads.files');
    const collectionChunks = db.collection('uploads.chunks');

    const page = parseInt(req.query.page)
    const limit = 1
  
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    try {
      collection.find({'filename': {$regex: `^${Title}_Q`}}).limit(limit).skip(startIndex).toArray(function(err, docs){
        if(err){
          if (role === 'student')
            return res.render('results/student.hbs', {title: Title, message: 'No File Found'});
          else
            return res.render('results/faculty.hbs', {title: Title, message: 'No File Found'});
        }
        if(!docs || docs.length === 0){
          if (role === 'student')
            return res.render('results/student.hbs', {title: Title, message: 'Error retrieving chunks'});
          else
            return res.render('results/faculty.hbs', {title: Title, message: 'Error retrieving chunks'});
        }else{
        //Retrieving the chunks from the db
          collectionChunks.find({files_id : docs[0]._id}).sort({n: 1}).toArray(function(err, chunks){
            if(err){
              if (role === 'student')
                return res.render('results/student.hbs', {title: Title, message: 'Error retrieving chunks', error: err.errmsg});
              else
                return res.render('results/faculty.hbs', {title: Title, message: 'Error retrieving chunks', error: err.errmsg});
            }
            if(!chunks || chunks.length === 0){
              //No data found
              return res.render('result.hbs', {title: Title, message: 'No data found', layout: false});
            }
            //Append Chunks
            let fileData = [];
            for(let i=0; i<chunks.length;i++){
              //This is in Binary JSON or BSON format, which is stored
              //in fileData array in base64 endocoded string format
              fileData.push(chunks[i].data.toString('base64'));
            }
            //Display the chunks using the data URI format
            let finalFile = 'data:' + docs[0].contentType + ';base64,' + fileData.join('');

            req.app.set('curpage', page);
            let Sname = req.params.name || req.user.fullName;

            var tcCount = 0;
            testcase.find({questionid: docs[0]._id, sample: 'false'}).exec((err, testcases) => {
              tcCount = testcases.length;
            
              var query = { name: Sname, questionid: docs[0]._id };
              col.findOne(query, (err, docr) => {
                if (err) {
                  console.log(err);
                } else {
                  var s = 0;
                  var c = '';
                  var p = 0;
                  if (docr !== null) {
                    s = docr.score;
                    c = docr.code;
                    p = docr.passedCases;
                  }
                  if (role === 'student')
                    res.render('results/student.hbs', {username: req.user.fullName, title: Title, pages: page, total: questions, fileurl: finalFile, score: s, code: c, pass: p, totalT: tcCount, layout: false});
                  else
                    res.render('results/faculty.hbs', {username: req.user.fullName, title: Title, pages: page, total: questions, fileurl: finalFile, student: Sname, score: s, code: c, pass: p, totalT: tcCount, layout: false});
                }
              });
            });
          });
        } 
      });
      } catch (e) {
        res.status(500).json({ message: e.message })
      }
    });
};

module.exports.total = (req, res) => {
    let Title = req.params.title;
    MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true}, function(err, client){
      if(err){
        return res.render('resultF.hbs', {username: req.user.fullName, title: Title, message: 'MongoClient Connection error', error: err.errMsg});
      }
      const db = client.db(dbName);
      const col = db.collection(Title);

      col.find().toArray((err, results) => {
        const unique = [...new Set(results.map(item => item.name))];
        res.render('resultF.hbs', {username: req.user.fullName, title: Title, count: unique.length, subs: unique})
      });
    });
};