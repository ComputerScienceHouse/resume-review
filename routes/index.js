import express from 'express';
import moment from 'moment';

import db from '../db/index.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const resumes = await db.resumes.newestByAuthor()
    res.render('index', { resumes, user: req.user, moment, homeActive: true,});
  } catch (e) {
    res.status(500).render('index', { resumes: null, user: req.user, moment, homeActive: true, error: `Error encountered: ${e}` });
  }
});

export default router;
