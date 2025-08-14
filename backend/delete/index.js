import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler = async (event) => {
  console.log("Incoming event:", event);

  const tripId = event?.queryStringParameters?.tripId;
  const userId = event?.queryStringParameters?.userId;

  if (!tripId || !userId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify("Missing 'tripId' or 'userId' in query string"),
    };
  }

  const params = {
    TableName: "TripTrek",
    Key: {
      pk: userId,
      sk: tripId,
    },
    ReturnValues: "ALL_OLD",
  };

  try {
    const result = await ddbDocClient.send(new DeleteCommand(params));

    if (!result.Attributes) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify(`Trip with ID '${tripId}' not found for user '${userId}'.`),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify("Trip deleted successfully"),
    };
  } catch (err) {
    console.error("Error deleting trip from DynamoDB", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify("Error deleting trip from DynamoDB"),
    };
  }
};