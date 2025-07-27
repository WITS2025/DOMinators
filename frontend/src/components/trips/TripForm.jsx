import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    // CORS preflight
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  let body;
  try {
    body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch (err) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Invalid JSON" }),
    };
  }

  const { pk, destination, startDate, endDate, itinerary } = body;

  // Validate required fields
  if (!pk || !destination || !startDate || !endDate || !Array.isArray(itinerary)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Missing required fields or invalid itinerary" }),
    };
  }

  // Validate itinerary structure
  for (const day of itinerary) {
    if (!day.date || !Array.isArray(day.activities)) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Invalid itinerary day structure" }),
      };
    }
    for (const act of day.activities) {
      if (typeof act.name !== "string" || typeof act.time !== "string") {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Invalid activity format" }),
        };
      }
    }
    if (day.photoUrls && !Array.isArray(day.photoUrls)) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "photoUrls must be an array" }),
      };
    }
  }

  // Optional: Check if trip already exists
  try {
    const existing = await ddbDocClient.send(
      new GetCommand({ TableName: "TripTrek", Key: { pk } })
    );

    if (existing.Item) {
      // If you want to disallow overwrite, return error here
      // or allow update below
    }
  } catch (err) {
    console.error("Error reading from DynamoDB:", err);
  }

  const item = {
    pk,
    destination,
    startDate,
    endDate,
    itinerary,
    updatedAt: new Date().toISOString(),
  };

  try {
    await ddbDocClient.send(
      new PutCommand({
        TableName: "TripTrek",
        Item: item,
      })
    );

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Trip saved successfully", tripId: pk }),
    };
  } catch (err) {
    console.error("Error writing to DynamoDB:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Error saving trip" }),
    };
  }
};
