const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3();
const bucketName = process.env.BUCKET_NAME;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { fileType } = body;

    if (!fileType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing fileType" })
      };
    }

    const extension = fileType.split('/')[1] || 'jpg';
    const key = `${uuidv4()}.${extension}`;

    const params = {
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      Expires: 300
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl,
        imageUrl: `https://${bucketName}.s3.amazonaws.com/${key}`
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
