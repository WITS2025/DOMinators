import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "PATCH,OPTIONS",
};

const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  console.log("Event received:", event);

  if (!TABLE_NAME) {
    console.error("TABLE_NAME environment variable is missing");
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Server configuration error: TABLE_NAME not set" }),
    };
  }

  // Handle CORS preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  const tripId = event?.queryStringParameters?.tripId;

  if (!tripId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Missing 'tripId' in query string" }),
    };
  }

  let requestBody;
  try {
    requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Invalid JSON body" }),
    };
  }

  const { attributeName, newValue } = requestBody || {};

  if (!attributeName || typeof newValue === "undefined") {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Missing 'attributeName' or 'newValue' in body" }),
    };
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { pk: tripId },
    UpdateExpression: "set #attr = :val",
    ExpressionAttributeNames: {
      "#attr": attributeName,
    },
    ExpressionAttributeValues: {
      ":val": newValue,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const data = await ddbDocClient.send(new UpdateCommand(params));
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(data.Attributes),
    };
  } catch (err) {
    console.error("Error updating item in DynamoDB", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Error updating item in DynamoDB" }),
    };
  }
};
