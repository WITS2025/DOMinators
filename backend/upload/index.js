import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3();
const bucketName = process.env.BUCKET_NAME; // Make sure to set this env var

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { fileType } = body;

    if (!fileType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing fileType" }),
      };
    }

    // Extract extension, fallback to jpg if missing
    const extension = fileType.split('/')[1] || "jpg";
    const key = `uploads/${uuidv4()}.${extension}`;

    const params = {
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      Expires: 300, // URL expires in 5 minutes
    };

    // Generate presigned URL
    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

    // Public URL of the uploaded image
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadUrl, imageUrl }),
    };
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};

