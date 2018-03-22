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
        res.render('view', { resume: data, url: getUrl(req.params.id), user: req.user._json });
    })
    .catch(error => console.log(error));
  });

module.exports = router;
