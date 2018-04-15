# Resume Review

To develop locally, create `nodemon.json` with the following environment variables filled in:
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
    "OIDC_SESSION_SECRET": ""
    "ADMINS": ""
  }
}
```
and run `npm install`, then `nodemon resume-review`.