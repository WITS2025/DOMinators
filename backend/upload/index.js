const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3();
const db = new AWS.DynamoDB.DocumentClient();

const bucketName = process.env.BUCKET_NAME;
const tableName = process.env.LOCATIONS_TABLE; // Set this in your template.yaml

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { fileType, locationId } = body;

    if (!fileType || !locationId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing fileType or locationId" }),
      };
    }

    const extension = fileType.split('/')[1] || 'jpg';
    const key = `locations/${locationId}/${uuidv4()}.${extension}`;

    const params = {
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      Expires: 300,
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

  
    await db.update({
      TableName: tableName,
      Key: { id: locationId },
      UpdateExpression: 'SET imageUrl = :imageUrl',
      ExpressionAttributeValues: {
        ':imageUrl': imageUrl
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadUrl,
        imageUrl
      })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};
