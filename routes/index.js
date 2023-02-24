import express from 'express';
import moment from 'moment';

import db from '../db/index.js';

const router = express.Router();

router.get('/',
  (req, res, next) => {
    db.resumes.newestByAuthor()
      .then(data => {
        res.render('index', { resumes: data, user: req.user._json, moment, homeActive: true });
      })
      .catch(error => console.log(error));
  });

export default router;
