import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

const TABLE_NAME = process.env.TABLE_NAME;  // Get table name from environment variable

export const handler = async (event) => {
  console.log("Event received:", event);

  if (!TABLE_NAME) {
    console.error("Missing TABLE_NAME environment variable");
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Server configuration error: TABLE_NAME is not set." }),
    };
  }

  // Handle OPTIONS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    console.log("Scan success:", data);

    if (!data.Items || data.Items.length === 0) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "No trips found" }),
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
      body: JSON.stringify({ message: "Error retrieving trip items from DynamoDB" }),
    };
  }
};
