var express = require('express');
var router = express.Router();
const hasha = require('hasha');
const config = require('../config');
const db = require('../db');

router.post('/',
  (req, res, next) => {
    const author = req.user._json.preferred_username;
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(req.body);
    if (!req.body.parent_id || !req.body.body) {
      res.status(400);
      res.send('error');
      return;
    }
    db.comments.add({
      id: hasha(req.body.body + author + date, {algorithm: 'md5'}),
      parent_id: req.body.parent_id,
      author,
      body: req.body.body,
      date,
    })
    .then(data => {
      res.status(200);
      res.send('success');
    })
    .catch(error => {
      res.status(500);
      console.log(error);
      res.send('error');
    });
  }
);

router.delete('/',
  (req, res, next) => {
    const user = req.user._json.preferred_username;
    const id = req.body.id;
    if (!id) {
      res.status(400);
      res.send('Did not pass comment ID');
    }
    db.comments.find(id)
      .then(comment => {
        if (user === comment.author || config.admins.includes(user)) {
          db.comments.delete(id)
            .then(result => {
              console.log(result);
              if (result) {
                res.status(200);
                res.send('success');
              }
            })
            .catch(error => {
              res.status(500);
              res.send('Could not delete comment');
              console.log(error);
            })
        } else {
          res.status(403);
          res.send('Not permitted to delete comment');
        }
      })
      .catch(error => {
        res.status(500);
        res.send('Could not delete comment');
        console.log(error);
      })
  }
);

module.exports = router;
