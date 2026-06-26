const { SESClient } = require("@aws-sdk/client-ses");
const { SNSClient } = require("@aws-sdk/client-sns");
const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

const config = {
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
  // If AWS_ENDPOINT_URL is set (like http://localstack:4566), we use it. Otherwise, defaults to AWS.
  ...(process.env.AWS_ENDPOINT_URL && { endpoint: process.env.AWS_ENDPOINT_URL }),
};

const ses = new SESClient(config);
const sns = new SNSClient(config);
const s3 = new S3Client({ ...config, forcePathStyle: true }); // Essential for LocalStack S3

module.exports = {
  ses,
  sns,
  s3,
};
