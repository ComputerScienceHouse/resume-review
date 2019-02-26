# Resume Review

![The homepage of CSH Resume Review](https://csh.rit.edu/~ram/resumes/homepage.png)
![Viewing a resume on the site](https://csh.rit.edu/~ram/resumes/resume.png)

## Overview

Resume Review is a web app written for [CSH](https://csh.rit.edu/) members to
upload their resumes and receive feedback on them. Members can prepare for
career fairs, company visits, and job applications by running their resumes by
their peers, requesting specific changes or just asking for general opinions.

The site was made using Express, a Node.js framework. It runs on CSH’s
OpenShift Origin cluster, uses our internal S3 to store files, and stores
metadata and comments in a PostgreSQL database.

See my blog post about it on CSH's blog [here](https://blog.csh.rit.edu/2018/04/30/resume-review/).

## Developing locally

Create `nodemon.json` with the following environment variables filled in:
```
{
  "env": {
    "PORT": "",
    "DB_NAME": "",
    "DB_USERNAME": "",
    "DB_PASSWORD": "",
    "S3_ACCESS_KEY_ID": "",
    "S3_SECRET_ACCESS_KEY": "",
    "S3_URL": "",
    "S3_BUCKET": "",
    "OIDC_CLIENT_ID": "",
    "OIDC_CLIENT_SECRET": "",
    "OIDC_CALLBACK_URL": "",
    "OIDC_SESSION_SECRET": "",
    "ADMINS": "",
    "SMTP_HOST": "",
    "SMTP_PORT": ,
    "SMTP_USERNAME": "",
    "SMTP_PASSWORD": ""
  }
}
```
and run `npm install`, then `nodemon resume-review`.