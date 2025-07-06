import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const handler = async (event) => {
  console.log("Incoming event:", event);

  const tripId = event?.queryStringParameters?.tripId;

  if (!tripId) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify("Missing 'tripId' in query string"),
    };
  }

  const params = {
    TableName: "TripTrek",
    Key: { pk: tripId },
    ReturnValues: "ALL_OLD",
  };
  
  try {
    const result = await ddbDocClient.send(new DeleteCommand(params));
  
    if (!result.Attributes) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify(`Trip with ID '${tripId}' not found.`),
      };
    }
    return {
      statusCode: 200, // No Content
      headers: headers,
      body: JSON.stringify("Trip deleted successfully"),
    };
  } catch (err) {
    console.error("Error deleting trip from DynamoDB", err);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify("Error deleting trip from DynamoDB"),
    };
  }
};
