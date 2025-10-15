import express from 'express';
import {hash} from 'hasha';
import nodemailer from 'nodemailer';
import escape from 'escape-html';

import config from '../config.js';
import db from '../db/index.js';

const router = express.Router();

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

async function notifyOwner(commenter, parent_id, body) {
  try {
    const parent_resume = await db.resumes.find(parent_id)
    if (parent_resume) { // top level comment, parent_id was a resume
      if (parent_resume.author !== commenter) {
        sendEmail(parent_resume.author, commenter, parent_id, body)
        return
      }
    }
    
    // threaded comment, parent_id was a comment, find its resume
    const parent_comment = await db.comments.find(parent_id)
    if (!parent_comment) {
      console.warn(`Parent comment with id ${parent_id} not found.`);
      return;
    }

    const resume = await db.resumes.find(parent_comment.parent_id)
    if (!resume) {
      console.warn(`Parent resume with id ${parent_id} not found.`);
      return;
    }

    if (resume.author !== commenter) {
      sendEmail(resume.author, commenter, resume.id, body);
    }
  } catch(e) { 
    console.error(`Error while attemping to send email: \n${e}`)
  }
}

async function deleteChildComments(id) {
  try {
    const comments = await db.comments.findByParent(id)
    const deletions = comments.map(comment => db.comments.delete(comment.id))

    await Promise.all(deletions) // paralel deletion 
  } catch (e) {
    console.error(`Error deleting comments: \n${e}`)
  }
}

router.post('/', async (req, res, next) => {
  const author = req.user.username;
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

  if (!req.body.parent_id || !req.body.body) {
    res.status(400).send('error');
    return;
  }

  try {
    const data = await db.comments.add({
      id: await hash(req.body.body + author + date, {algorithm: 'md5'}),
      parent_id: req.body.parent_id,
      author,
      body: req.body.body,
      date,
    })

    res.status(200).send('success');
    notifyOwner(author, req.body.parent_id, escape(req.body.body)); // send email on successful comment
  } catch(e) {
    console.error(`Error while writing comment to db: \n${e}`)
    res.status(500).send(`Error while writing comment to db: \n${e}`);
  }
});

router.delete('/', async (req, res, next) => {
    const user = req.user.username;
    const id = req.body.id;
    if (!id) {
      res.status(400);
      res.send('Did not pass comment ID');
    }

    try {
      const comment = await db.comments.find(id)

      if (user === comment.author || config.admins.includes(user)) {
        deleteChildComments(id);
        const result = await db.comments.delete(id)
        if (result) {
          res.status(200).send("success");
        }
      } else {
        res.status(403).send('Not permitted to delete comment');  
      }
    } catch(e) {
      console.error(`Error while deleting comment: \n${e}`)
      res.status(500).send(`Error while deleting comment: \n${e}`)
    }
  }
);

export default router;
