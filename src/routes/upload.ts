import express from 'express';
import { hash } from 'hasha';
import multer from 'multer';

import config from '../config.js';
import db from '../db/index.js';
import s3 from '../s3.js';
import type { CSHUser } from '../types.js';

const router = express.Router();
const upload = multer();

router.get('/', (req, res) => {
    res.render('upload', { user: req.user, uploadActive: true });
});

router.post('/', upload.single('resume'), async (req, res) => {
    // verify file has been uploaded
    if (!req.file) {
        res.status(400).render('upload', { user: req.user, error: 'File has failed to upload' });
        return;
    }
    // verify file is less than 5 MB
    if ((req.file.size / 1000000) > 5) {
        res.status(400).render('upload', { user: req.user, error: 'Maximum file size is 5 MB' });
        return;
    }
    // verify file is a PDF
    if (req.file.mimetype !== 'application/pdf') {
        res.status(400).render('upload', { user: req.user, error: 'File must be a PDF' });
        return;
    }
    // verify user isn't very unoriginal
    if ((req.body.title || req.file.originalname).toLowerCase() === 'resume.pdf') {
        res.status(400).render('upload', { user: req.user, error: 'Really? "resume.pdf"? C\'mon.' });
        return;
    }

    const id = await hash(req.file.buffer, { algorithm: 'md5' });
    const existingResume = await db.resumes.find(id);
    if (existingResume) { // Same resume already exists
        res.status(400).render('upload', { user: req.user, error: `File already uploaded.` });
        return;
    }

    // verify that the user exists on the request
    if (!req.user) {
        res.status(400).render('upload', { user: req.user, error: 'File has failed to upload' });
        return;
    }

    const authorUsername = (req.user as CSHUser).username;

    try {
        const filename = req.body.title || req.file.originalname;
        const date = new Date().toISOString().slice(0, 19).replace('T', ' '); // sql format

        await db.resumes.add({
            id: id,
            author: authorUsername,
            filename: filename,
            date: date
        });

        await s3.putObject({
            Bucket: config.s3.bucket,
            Key: id,
            Body: req.file.buffer,
            ContentType: 'application/pdf',
        }).promise();
    } catch (e) {
        console.error('Upload error:', e);
        res.status(500).render('upload', { user: req.user, error: `Error while uploading: ${e}` });
        return;
    }

    res.redirect('/resumes/view/user/' + authorUsername);
});

export default router;
