import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("Event received:", event);

  const tripId = event?.queryStringParameters?.tripId;

  if (!tripId) {
    return {
      statusCode: 400,
      body: JSON.stringify("Missing 'tripId' in query string"),
    };
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify("Invalid JSON body"),
    };
  }

  const { attributeName, newValue } = requestBody;

  if (!attributeName || typeof newValue === 'undefined') {
    return {
      statusCode: 400,
      body: JSON.stringify("Missing 'attributeName' or 'newValue' in body"),
    };
  }

  const params = {
    TableName: "TripTrek",
    Key: { pk: tripId },
    UpdateExpression: "set #attr = :val",
    ExpressionAttributeNames: {
      "#attr": attributeName
    },
    ExpressionAttributeValues: {
      ":val": newValue
    },
    ReturnValues: "UPDATED_NEW"
  };

  try {
    const data = await ddbDocClient.send(new UpdateCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(data.Attributes),
    };
  } catch (err) {
    console.error("Error updating item in DynamoDB", err);
    return {
      statusCode: 500,
      body: JSON.stringify("Error updating item in DynamoDB"),
    };
  }
};
