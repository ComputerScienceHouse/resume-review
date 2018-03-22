var express = require('express');
var router = express.Router();
const config = require('../config');
const db = require('../db');
const s3 = require('../s3');
const hasha = require('hasha');
const multer = require('multer');
const upload = multer();

router.get('/',
  (req, res) => {
    res.render('upload', { user: req.user._json });
  });

router.post('/',
  upload.single('resume'),
  (req, res) => {
    if (req.file.mimetype !== 'application/pdf') {
      res.status(400).send('Upload a PDF');
      return;
    }
    var id = hasha(req.file.buffer, {algorithm: 'md5'});
    var filename = req.file.originalname;
    var author = req.user._json.preferred_username;
    var date = new Date().toISOString().slice(0, 19).replace('T', ' '); // sql format
    db.resumes.add({
      id: id,
      filename: filename,
      author: author,
      date: date,
    }).then(() => {
      let params = {
        Bucket: config.s3.bucket,
        Key: id,
        Body: req.file.buffer,
        ContentType: 'application/pdf',
      };
      s3.putObject(params, function(error, data) {
        if (error) {
          res.send('Could not upload file');
          console.log('Could not upload file');
        } else {
          res.redirect('/resumes/view/' + id);
        }
      })
    }).catch(() => {
      res.send('Could not upload file');
      console.log('Could not upload file');
    });
  });

module.exports = router;
