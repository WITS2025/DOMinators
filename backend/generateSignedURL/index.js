import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-east-1" }); // use your actual region
const BUCKET_NAME = "your-bucket-name"; // set your S3 bucket name

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Invalid JSON" }),
    };
  }

  const { fileName, fileType } = body;

  if (!fileName || !fileType) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Missing fileName or fileType" }),
    };
  }

  const key = `uploads/${Date.now()}_${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // valid for 5 mins
    const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ uploadUrl, imageUrl }),
    };
  } catch (err) {
    console.error("Error generating signed URL", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Failed to generate signed URL" }),
    };
  }
};
