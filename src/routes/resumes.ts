import express from 'express';
import moment from 'moment';

import config from '../config.js';
import db from '../db/index.js';
import s3 from '../s3.js';
import type { Comment, CSHUser, Resume } from '../types.js';

const router = express.Router();

function getUrl(id: string) {
    var params = {
        Bucket: config.s3.bucket,
        Key: id,
        Expires: 60,
        ResponseContentType: 'application/pdf',
    };
    return s3.getSignedUrl('getObject', params);
}

function getChildComments(parent_id: string) {
    return db.comments.findByParent(parent_id);
}

async function buildCommentThreads(resume_id: string) {
    try {
        const comments = await db.comments.findByParent(resume_id)
        if (!comments) return [];
        let rootComments = [];

        for (let comment of comments) {
            rootComments.push(getChildComments(comment.id))
        }

        const data = await Promise.all(rootComments)
        comments.forEach((comment: Comment, index: number) => {
            comment.children = data[index] || [];
        });

        return comments
    } catch (e) {
        console.error(`Error while building comment threads: \n${e}`)
        return []
    }
}

function canEdit(user: string, author: string) {
    return user === author || config.admins.includes(user);
}

async function deleteChildComments(id: string) {
    const comments = await buildCommentThreads(id)
    let deletions = [];

    for (let parent of comments) {
        for (let child of parent.children) {
            deletions.push(db.comments.delete(child.id))
        }
        deletions.push(db.comments.delete(parent.id));
    }

    try {
        Promise.all(deletions)
    } catch (e) {
        console.error(`Error deleting comments: \n${e}`)
    }
}

router.get('/view/user/:uid', async (req, res, _next) => {
    try {
        const resumes = await db.resumes.findByAuthor(req.params.uid)
        if (!resumes || resumes.length == 0) {
            res.status(404).render('viewMany', { data: [], user: req.user, canEdit, moment, error: "User not found" })
            return
        }
        const comments = await Promise.all(resumes.map((resume: Resume) => buildCommentThreads(resume.id)))
        const data = resumes
            .map(
                (resume: Resume, index: number) => Object.assign(resume, { url: getUrl(resume.id), comments: comments[index] })
            )
            .sort(
                (a: Resume, b: Resume) => new Date(b.date).valueOf() - new Date(a.date).valueOf()
            );
        if (!data[0])
            throw new Error("No data was found");

        data[0].preview = true; // preview only the most recent resume by default
        res.render('viewMany', { data, user: req.user, canEdit, moment });

    } catch (e) {
        console.error(`Error while building resume data: \n${e}`)
        res.render('viewMany', { data: [], user: req.user, canEdit, moment, error: `Error while building resume data: \n${e}` });
    }

});

router.get('/delete/:id', async (req, res, _next) => {
    try {
        const data = await db.resumes.find(req.params.id)
        if (!canEdit((req.user as CSHUser).username, data.author)) {
            res.status(403).send('Not your file to delete');
        }

        deleteChildComments(req.params.id)
        await db.resumes.delete(req.params.id)
        const params = {
            Bucket: config.s3.bucket,
            Key: req.params.id,
        };

        await s3.deleteObject(params).promise()
        res.redirect(config.auth.callback_url);
    } catch (e) {
        console.error(`Error while deleting resume: \n${e}`);
        res.status(500).send(`Error while deleting resume: \n${e}`)
    }
});

export default router;
