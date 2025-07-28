import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const REGION = process.env.AWS_REGION;
const TABLE_NAME = process.env.TABLE_NAME;

const ddbClient = new DynamoDBClient({ region: REGION });

export const handler = async (event) => {
  try {
    const { locationName, imageUrl } = JSON.parse(event.body);

    if (!locationName || !imageUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing locationName or imageUrl" }),
      };
    }

    const imageId = uuidv4();

    const params = {
      TableName: TABLE_NAME,
      Item: {
        pk: { S: locationName },
        sk: { S: `IMAGE#${imageId}` },
        imageUrl: { S: imageUrl },
        uploadedAt: { S: new Date().toISOString() },
      },
    };

    await ddbClient.send(new PutItemCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Image metadata saved", imageId }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to save image metadata" }),
    };
  }
};
