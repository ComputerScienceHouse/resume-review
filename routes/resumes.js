var express = require('express');
var router = express.Router();
const hasha = require('hasha');
const moment = require('moment');
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

function getChildComments(parent_id) {
  return db.comments.findByParent(parent_id);
}

function getComment(id) {
  return db.comments.find(id);
}

function buildCommentThreads(resume_id) {
  return db.comments.findByParent(resume_id)
    .then(comments => {
      let rootComments = [];
      for (let comment of comments) {
        rootComments.push(getChildComments(comment.id));
      }
      return Promise.all(rootComments)
        .then(data => {
          for (let i = 0; i < data.length; i++) {
            comments[i].children = [];
            for (let child of data[i]) {
              comments[i].children.push(child);
            }
          }
          return comments;
        });
    });
}

function canEdit(user, author) {
  return user === author || config.admins.includes(user);
}

function deleteChildComments(id) {
  buildCommentThreads(id)
    .then(comments => {
      for (let parent of comments) {
        for (let child of parent.children) {
          db.comments.delete(child.id);
        }
        db.comments.delete(parent.id);
      }
    })
}

router.get('/view/user/:uid',
  (req, res, next) => {
    db.resumes.findByAuthor(req.params.uid).then(resumes => {
      if (resumes) {
        Promise.all(resumes.map(resume => buildCommentThreads(resume.id)))
          .then(comments => {
            const data = resumes
              .map(
                (resume, index) => Object.assign(resume, { url: getUrl(resume.id), comments: comments[index] })
              )
              .sort(
                (a, b) => new Date(b.date) - new Date(a.date)
              );
            data[0].preview = true; // preview only the most recent resume by default
            res.render('viewMany', { data, user: req.user._json, canEdit, moment });
          })
      }
    });
  });

router.get('/delete/:id',
  (req, res, next) => {
    db.resumes.find(req.params.id)
    .then(data => {
      if (canEdit(req.user._json.preferred_username, data.author)) {
        deleteChildComments(req.params.id);
        db.resumes.delete(req.params.id)
        .then(() => {
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
