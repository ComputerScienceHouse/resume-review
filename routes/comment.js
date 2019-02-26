var express = require('express');
var router = express.Router();
const hasha = require('hasha');
const nodemailer = require('nodemailer/lib/nodemailer');
const escape = require('escape-html');
const config = require('../config');
const db = require('../db');


function sendEmail(owner, author, parent_id, body) {
  const transporter = nodemailer.createTransport(
    {
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.username,
        pass: config.email.password,
    },
      logger: false,
      debug: false, // don't log debug info
    },
    {
      from: 'CSH Resume Review <resumes@csh.rit.edu>',
    }
  );

  const message = {
    to: owner + '<' + owner + '@csh.rit.edu>',
    subject: author + ' commented on your resume!',
    text: 'You have a new comment on your resume!\n' +
    'They said: "' + body + '"\n' +
    'Read it or reply here: https://resumes/view/' + parent_id + '.', // plaintext body

    html: '<p>You have a new comment on your resume!</p>' +
      '<p>They said: "' + body + '".</p>' +
      '<a href="https://resumes.csh.rit.edu/resumes/view/' + parent_id + '">Click here to read it or respond!</a>' //html body
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log('Error sending mail to ' + owner + 'for comment by ' + author);
      console.log(err.message);
    } else {
      console.log('Mail sent successfully to ' + owner + 'for comment by ' + author);
    }
  });
}


function notifyOwner(commenter, parent_id, body) {
    const parent_resume = db.resumes.find(parent_id)
      .then(data => {
        if (data) { // top level comment, parent_id was a resume
          if (data.author !== commenter) {
            sendEmail(data.author, commenter, parent_id, body);
          }
        } else { // threaded comment, parent_id was a comment, find its resume
          db.comments.find(parent_id).then(parent_comment => { // get parent comment
            db.resumes.find(parent_comment.parent_id).then(parent_resume => { // get parent resume
              if (parent_resume.author !== commenter) {
                sendEmail(parent_resume.author, commenter, parent_resume.id, body);
              }
            });
          });
        }
      })
      .catch(err => {
        console.log('Mail error:\n', err);
      });
}


function deleteChildComments(id) {
  db.comments.findByParent(id)
    .then(comments => {
      for (let comment of comments) {
        db.comments.delete(comment.id);
      }
    })
}

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
      notifyOwner(author, req.body.parent_id, escape(req.body.body)); // send email on successful comment
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
          deleteChildComments(id);
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
