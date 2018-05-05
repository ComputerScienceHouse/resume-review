const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../db');
const s3 = require('../s3');
const config = require('../config');

router.get('/',
  (req, res, next) => {
    db.resumes.all()
      .then(data => {
        res.render('index', { resumes: data, user: req.user._json, moment, homeActive: true });
      })
      .catch(error => console.log(error));
  });

module.exports = router;
