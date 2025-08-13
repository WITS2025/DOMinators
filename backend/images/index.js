import AWS from 'aws-sdk';

const s3 = new AWS.S3();

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "PUT,OPTIONS"
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const { fileName, fileType } = body;

  if (!fileName || !fileType) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'fileName and fileType are required' }),
    };
  }

  const bucketName = process.env.LOCATION_IMAGES_BUCKET;
  const key = `locations/${fileName}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
    Expires: 900, // 15 minutes
  };

  try {
    const uploadUrl = s3.getSignedUrl('putObject', params);
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ uploadUrl, imageUrl }),
    };
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to generate upload URL' }),
    };
  }
};