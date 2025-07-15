import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

export const handler = async (event) => {
  console.log("Event received:", event);

  const params = {
    TableName: "TripTrek"
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    console.log("Scan success:", data);

    if (!data.Items || data.Items.length === 0) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify("No trips found"),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(data.Items),
    };
  } catch (err) {
    console.error("Error retrieving trip items from DynamoDB", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify("Error retrieving trip items from DynamoDB"),
    };
  }
};