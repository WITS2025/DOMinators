import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

export const handler = async (event) => {
  const userId = event?.queryStringParameters?.userId;

  if (!userId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify("Missing userId"),
    };
  }

  const params = {
    TableName: "TripTrek",
    KeyConditionExpression: "pk = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(data.Items),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify("Error retrieving trips"),
    };
  }
};
