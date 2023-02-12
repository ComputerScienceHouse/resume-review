const AWS = require('aws-sdk');
const config = require('./config');

const s3 = new AWS.S3({
    endpoint: config.s3.url,
    s3ForcePathStyle: true,
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
    region: 'us-east-1'
});

module.exports = s3;
