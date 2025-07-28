import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "PATCH,OPTIONS",
};

const TABLE_NAME = process.env.LOCATIONS_TABLE || "TripTrek";

function buildUpdateExpression(updates) {
  // updates: object where keys are attribute paths, values are new values
  let UpdateExpression = "set ";
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};

  const parts = [];
  let index = 0;

  for (const key in updates) {
    // Use placeholders to avoid reserved word issues
    // Support nested keys with dot notation like itinerary[0].activities[1].name

    // Replace dots and brackets with placeholders
    // For example: itinerary[0].activities[1].name
    // Becomes: #attr0.#attr1.#attr2.#attr3

    const attrNames = key
      .replace(/\[(\d+)\]/g, ".$1") // convert [0] to .0
      .split(".")
      .map((part, i) => {
        // If part is a number (array index), leave as is (DynamoDB supports numeric indexes)
        if (/^\d+$/.test(part)) return part;
        const placeholder = `#attr${index}_${i}`;
        ExpressionAttributeNames[placeholder] = part;
        return placeholder;
      });

    const attrPath = attrNames.join(".");

    const valPlaceholder = `:val${index}`;
    ExpressionAttributeValues[valPlaceholder] = updates[key];

    parts.push(`${attrPath} = ${valPlaceholder}`);

    index++;
  }

  UpdateExpression += parts.join(", ");

  return { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues };
}

export const handler = async (event) => {
  console.log("Event received:", event);

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
    requestBody = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Invalid JSON body" }),
    };
  }

  if (!requestBody || typeof requestBody !== "object" || Array.isArray(requestBody)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Request body must be a JSON object with attributes to update" }),
    };
  }

  // Build UpdateExpression
  let updateParams;
  try {
    updateParams = buildUpdateExpression(requestBody);
  } catch (err) {
    console.error("Error building update expression:", err);
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Invalid update attributes" }),
    };
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { pk: tripId },
    UpdateExpression: updateParams.UpdateExpression,
    ExpressionAttributeNames: updateParams.ExpressionAttributeNames,
    ExpressionAttributeValues: updateParams.ExpressionAttributeValues,
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
    console.error("Error updating item in DynamoDB:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Error updating item in DynamoDB" }),
    };
  }
};
