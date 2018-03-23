var express = require('express');
var router = express.Router();
const config = require('../config');
const db = require('../db');
const s3 = require('../s3');

function getUrl(id) {
  var params = {
    Bucket: config.s3.bucket,
    Key: id,
    Expires: 60,
    ResponseContentType: 'application/pdf',
  };
  return s3.getSignedUrl('getObject', params);
}

router.get('/view/:id',
  (req, res, next) => {
    db.resumes.find(req.params.id)
    .then(data => {
      const isOwner = req.user._json.preferred_username === data.author;
      res.render('view', { resume: data, url: getUrl(req.params.id), user: req.user._json, isOwner });
    })
    .catch(error => console.log(error));
  });

router.get('/delete/:id',
  (req, res, next) => {
    db.resumes.find(req.params.id)
    .then(data => {
      const isOwner = req.user._json.preferred_username === data.author;
      if (isOwner) {
        db.resumes.delete(req.params.id)
        .then(result => {
          const params = {
            Bucket: config.s3.bucket,
            Key: req.params.id,
          };
          return s3.deleteObject(params, (error, data) => {
            if (error) {
              console.log(error);
              res.send('Could not delete file');
            } else {
              res.redirect(config.auth.callback_url);
            }
          });
        })
        .catch(error => {
          console.log(error)
        });
      } else {
        res.status(403);
        res.send('Not your file to delete');
      }
    })
    .catch(error => console.log(error));
  });

module.exports = router;
