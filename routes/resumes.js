var express = require('express');
var router = express.Router();
const config = require('../config');
const db = require('../db');
const s3 = require('../s3');

router.get('/view/:id', function(req, res, next) {
    db.resumes.find(req.params.id)
    .then(data => {
        res.render('view', { resume: data });
    })
    .catch(error => console.log(error));
});

router.get('/get/:id', function(req, res, next) {
  var params = {
      Bucket: config.s3.bucket,
      Key: req.params.id,
      Expires: 60,
  };
  s3.getSignedUrl('getObject', params, (error, url) => {
      if (error) {
          res.send('Could not find file with ID: ' + req.params.id);
      }
      res.redirect(url);
  });
});

module.exports = router;
