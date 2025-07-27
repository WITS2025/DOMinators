const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3();
const db = new AWS.DynamoDB.DocumentClient();

const bucketName = process.env.BUCKET_NAME;
const tableName = process.env.LOCATIONS_TABLE;

exports.handler = async (event) => {
  console.log("Incoming event:", event);

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
    const imageKey = `locations/${locationId}/${uuidv4()}.${extension}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: imageKey,
      ContentType: fileType,
      Expires: 300, // 5 minutes
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', uploadParams);
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageKey}`;

    // Update DynamoDB with the image URL
    await db.update({
      TableName: tableName,
      Key: { pk: locationId },
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
    console.error("Error generating signed URL or updating DB:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};

