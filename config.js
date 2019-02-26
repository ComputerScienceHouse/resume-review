const config = {};

config.port = process.env.PORT || '4200';

config.db = {};
config.db.name = process.env.DB_NAME;
config.db.username = process.env.DB_USERNAME;
config.db.password = process.env.DB_PASSWORD;

config.s3 = {};
config.s3.accessKeyId = process.env.S3_ACCESS_KEY_ID;
config.s3.secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
config.s3.url = process.env.S3_URL || 'https://s3.csh.rit.edu';
config.s3.bucket = process.env.S3_BUCKET || 'ram_resumes';

config.auth = {};
config.auth.client_id = process.env.OIDC_CLIENT_ID;
config.auth.client_secret = process.env.OIDC_CLIENT_SECRET;
config.auth.callback_url = process.env.OIDC_CALLBACK_URL;
config.auth.session_secret = process.env.OIDC_SESSION_SECRET;

config.admins = process.env.ADMINS.split(' '); // get space delimited admin list

config.email = {};
config.email.host = process.env.SMTP_HOST;
config.email.port = process.env.SMTP_PORT;
config.email.username = process.env.SMTP_USERNAME;
config.email.password = process.env.SMTP_PASSWORD;

module.exports = config;