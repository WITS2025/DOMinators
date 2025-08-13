import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST",
};

export const handler = async (event) => {
  console.log("Raw event:", event);

  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (err) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Invalid JSON format." }),
    };
  }

  // Extract trip details and user ID from request body
  const { destination, startDate, endDate, imageUrl, id: tripID, itinerary = [], user } = body;
  const userId = user?.userId;

  // Validate required fields
  if (!userId || !tripID || !destination || !startDate || !endDate) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Missing required fields." }),
    };
  }

  // Validate itinerary activities
  for (const day of itinerary) {
    for (const activity of day.activities || []) {
      if (!activity.name || !activity.time) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Each activity must have a name and a time." }),
        };
      }
    }
  }

  // Check if the trip already exists for this user
  const getParams = {
    TableName: "TripTrek",
    Key: {
      pk: userId,
      sk: tripID,
    },
  };

  try {
    const existingTrip = await ddbDocClient.send(new GetCommand(getParams));
    if (existingTrip.Item) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Trip already exists." }),
      };
    }
  } catch (err) {
    console.error("Error checking for existing trip:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Error checking for existing trip." }),
    };
  }

  // Parse and validate trip dates
  const parseDate = (str) => {
    const [month, day, year] = str.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  try {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const duration = (end - start) / (1000 * 60 * 60 * 24);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || duration < 0) {
      throw new Error("Invalid or too short date range.");
    }
  } catch (err) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message }),
    };
  }

  // Construct the item to be saved in DynamoDB
  const tripItem = {
    pk: userId,
    sk: tripID,
    destination,
    startDate,
    endDate,
    itinerary,
    ...(imageUrl && { imageUrl }),
  };

  const params = {
    TableName: "TripTrek",
    Item: tripItem,
  };

  // Save the trip to DynamoDB
  try {
    await ddbDocClient.send(new PutCommand(params));
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Itinerary created successfully.", itinerary }),
    };
  } catch (err) {
    console.error("Error writing to DynamoDB:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Error creating item in DynamoDB." }),
    };
  }
};
