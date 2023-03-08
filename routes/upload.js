import express from 'express';
import hasha from 'hasha';
import multer from 'multer';
// Importing `pdf-parse/lib/pdf-parse.js` gets around needing to have `/test/data/05-versions-space.pdf`
// in root project directory
// https://gitlab.com/autokent/pdf-parse/-/issues/30
import parsePdf from 'pdf-parse/lib/pdf-parse.js';

import config from '../config.js';
import db from '../db/index.js';
import s3 from '../s3.js';

const router = express.Router();
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
    if ((req.body.title || req.file.originalname).toLowerCase() === 'resume.pdf') {
      res.status(400).render('upload', { user: req.user._json, error: 'Really? "resume.pdf"? C\'mon.' });
      return;
    }
    parsePdf(req.file.buffer)
    .then(_ => {
      var id = hasha(req.file.buffer, {algorithm: 'md5'});
      // check if resume is already uploaded
      db.resumes.find(id)
      .then((data) => {
        if (data) {
          res.status(400).send('File already uploaded.');
          return;
        }
        // if not found, upload it
        var filename = req.body.title || req.file.originalname;
        var authorUid = req.user._json.sub;
        var date = new Date().toISOString().slice(0, 19).replace('T', ' '); // sql format
        // add to DB
        db.resumes.add({
          id: id,
          uid: authorUid,
          filename: filename,
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
              res.send(`Could not upload file: ${error}`);
              console.log('Could not upload file');
            } else {
              res.redirect('/resumes/view/user/' + authorUid);
            }
          })
        }).catch((error) => {
          res.send(`Could not upload file: ${error}`);
        });
      })
      .catch((error) => {
        res.send(`Could not upload file: ${error}`);
      })
      })
    .catch(e => {
      res.status(500).render('upload', { user: req.user._json, error: `${e.name}: ${e.message}` });
    });
  });

export default router;
