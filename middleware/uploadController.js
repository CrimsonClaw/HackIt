require('../models/Form');

const MongoClient = require('mongodb');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const app = require('../routes/uploads');

const { data } = require('jquery');

const url = "mongodb+srv://mongo:mongo@cluster0-4zn27.mongodb.net/test?retryWrites=true&w=majority";
const dbName = "test";

let Title;

const conn = mongoose.createConnection(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
});

let storage = new GridFsStorage({
  url: url,
  file: (req, file) => {
    return {
      bucketName: 'uploads',       
      filename: Title + '_' + file.originalname
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

module.exports.loadHome = (req, res) => {
  Title = req.params.title;
  console.log(Title)
  MongoClient.connect(url, {useUnifiedTopology: true}, function(err, client){
    if(err){
        return res.render('tests/testCreate.hbs', {title: Title, message: 'MongoClient Connection error', error: err.errMsg, layout: 'upload.hbs'});
    }
    const db = client.db(dbName);
    
    const collection = db.collection('uploads.files');
    const collectionChunks = db.collection('uploads.chunks');

    collection.find({'filename': {$regex: `^${Title}_`}}).toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        res.render('tests/testCreate.hbs', { files: false, message: "Upload Files", layout: 'upload.hbs' });
      } else {
        files.map(file => {
          if (
            file.contentType === 'image/jpeg' ||
            file.contentType === 'image/png'
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
        });
        res.render('tests/testCreate.hbs', { title: Title, message: "Upload Files", files: files, layout: 'upload.hbs'});
      }
    });
  });
};

module.exports.uploadFile = async (req, res) => {
  Title = req.params.title;
  upload(req, res, (err) => {
    if(err){
      return res.render('tests/testCreate.hbs', {title: Title, message: 'File could not be uploaded', error: err, layout: 'upload.hbs'});
    }
    MongoClient.connect(url, {useUnifiedTopology: true}, function(err, client){
      if(err){
          return res.render('tests/testCreate.hbs', {title: Title, message: 'MongoClient Connection error', error: err.errMsg, layout: 'upload.hbs'});
      }
      res.redirect('back');
    });
  });
};

module.exports.testAvail = async (req, res, next) => {
  MongoClient.connect(url, {useUnifiedTopology: true}, function(err, client){

    if(err){
        return res.render('layouts/upload.hbs',{title: 'Uploaded Error', message: 'MongoClient Connection error', error: err.errMsg, layout: false});
    }

    test.find().exec((err, docs) => {
      // Check if files
      res.render('tests/staffTest.hbs', {status: "Faculty", message: "Tests Created", tests: docs, layout: 'testAvail'});
    });
  });
};

module.exports.viewTest = (req, res) => {
  Title = req.params.title;
  MongoClient.connect(url, {useUnifiedTopology: true}, function(err, client){
    if(err){
        return res.render('layouts/upload.hbs', {title: Title, message: 'MongoClient Connection error', error: err.errMsg, layout: false});
    }
    const db = client.db(dbName);
    
    const collection = db.collection('uploads.files');
    const collectionChunks = db.collection('uploads.chunks');

    collection.find({'filename': {$regex: `^${Title}_`}}).toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        res.render('layouts/upload.hbs', { title: Title, files: false, message: "Upload Questions", layout: false });
      } else {
        files.map(file => {
          if (
            file.contentType === 'image/jpeg' ||
            file.contentType === 'image/png'
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
        });
        res.render('layouts/upload.hbs', { title: Title, message: "Upload Questions", files: files, layout: false});
      }
    });
  });
};

module.exports.delete = (req, res) => {
  MongoClient.connect(url, {useUnifiedTopology: true}, function(err, client){
    if(err){
      return res.render('layouts/upload.hbs', {title: Title, message: 'MongoClient Connection error', error: err.errMsg, layout: false});
    }

    gfs.delete(new mongoose.Types.ObjectId(req.params._id), (err, data) => {
      if(err) {
        return res.status(404).json({ err: err.message });
      }
      res.redirect('back');
    });
  });
};