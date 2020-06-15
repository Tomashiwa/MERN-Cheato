if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    const AWS = require('aws-sdk');
    const env = require('./s3.env.js');

    const s3Client = new AWS.S3({accessKeyId: env.AWS_ACCESS_KEY, secretAccessKey: env.AWS_SECRET_ACCESS_KEY, region: env.region})

    const uploadParams = {
        Bucket: env.Bucket, 
        Key: '', // pass key
        Body: null, // pass file body
        ACL: 'public-read'
    };
     
    const s3 = {};
    s3.s3Client = s3Client;
    s3.uploadParams = uploadParams;
     
    module.exports = s3;
} else {
    const AWS = require('aws-sdk');

    const s3Client = new AWS.S3({accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET, region: process.env.S3_REGION});

    const uploadParams = {
        Bucket: process.env.S3_BUCKET, 
        Key: '', // pass key
        Body: null, // pass file body
        ACL: 'public-read'
    };
     
    const s3 = {};
    s3.s3Client = s3Client;
    s3.uploadParams = uploadParams;
     
    module.exports = s3;
}
 
