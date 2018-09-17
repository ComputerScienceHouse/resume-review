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
    res.render('upload', { user: req.user._json, uploadActive: true });
  });

router.post('/',
  upload.single('resume'),
  (req, res) => {
    // verify file is less than 5 MB
    if ((req.file.size / 1000000) > 5) {
      res.status(400).render('upload', { user: req.user._json, error: 'Maximum file size is 5 MB' });
      return;
    }
    // verify file is a PDF
    if (req.file.mimetype !== 'application/pdf') {
      res.status(400).render('upload', { user: req.user._json, error: 'File must be a PDF' });
      return;
    }
    // verify user isn't very unoriginal
    if (req.file.originalname.toLowerCase() === 'resume.pdf') {
      res.status(400).render('upload', { user: req.user._json, error: 'Really? "resume.pdf"? C\'mon.' });
      return;
    }
    var id = hasha(req.file.buffer, {algorithm: 'md5'});
    // check if resume is already uploaded
    db.resumes.find(id)
    .then((data) => {
      if (data) {
        res.status(400).send('File already uploaded. <a href="/resumes/view/' + id + '">View it here</a>');
        return;
      }
      // if not found, upload it
      var filename = req.body.title || req.file.originalname;
      var author = req.user._json.preferred_username;
      var date = new Date().toISOString().slice(0, 19).replace('T', ' '); // sql format
      // add to DB
      db.resumes.add({
        id: id,
        filename: filename,
        author: author,
        date: date,
      }).then(() => {
        // add to S3
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
      });
    })
    .catch((error) => {
      res.send('Could not upload file');
    });
  });

module.exports = router;
