const AWS = require('aws-sdk');
const config = require('./config');

const s3 = new AWS.S3({
    endpoint: config.s3.url,
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
});


module.exports = s3;