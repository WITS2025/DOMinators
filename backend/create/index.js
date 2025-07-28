import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const TABLE_NAME = process.env.LOCATIONS_TABLE || "TripTrek";

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  console.log("Raw event:", event);

  let body;
  try {
    body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch (err) {
    console.error("Invalid JSON body:", event.body);
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Invalid JSON format." }),
    };
  }

  const { destination, startDate, endDate, id: tripID } = body;

  if (!tripID || !destination || !startDate || !endDate) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Missing required fields: id, destination, startDate, endDate" }),
    };
  }

  const itinerary = (body.itinerary || []).map((day) => ({
    date: day.date,
    activities: (day.activities || []).map((activity) => ({
      name: activity.name,
      time: activity.time,
    })),
    photoUrls: Array.isArray(day.photoUrls) ? day.photoUrls : [],
  }));

  // Validate itinerary fields
  for (const day of itinerary) {
    if (!day.date) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Each itinerary day must have a date" }),
      };
    }
    for (const activity of day.activities) {
      if (!activity.name || !activity.time) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Each activity must have a name and a time." }),
        };
      }
    }
    for (const url of day.photoUrls) {
      if (typeof url !== "string" || !url.startsWith("http")) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Each photo URL must be a valid string URL." }),
        };
      }
    }
  }

  // Check if trip exists - if you want to disallow duplicates
  const getParams = {
    TableName: TABLE_NAME,
    Key: { pk: tripID },
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

  // Date parsing helper
  const parseDate = (str) => {
    if (typeof str !== "string") throw new Error("Date must be a string.");
    const [month, day, year] = str.split("/");
    if (!month || !day || !year) throw new Error("Invalid date format, expected MM/DD/YYYY.");
    return new Date(`${year}-${month}-${day}`);
  };

  try {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Invalid date format." }),
      };
    }

    const duration = (end - start) / (1000 * 60 * 60 * 24);
    if (duration < 1) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Trip must be at least 1 day long." }),
      };
    }
  } catch (err) {
    console.error("Date parsing error:", err.message);
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message }),
    };
  }

  const now = new Date().toISOString();

  const tripItem = {
    pk: tripID,
    destination,
    startDate,
    endDate,
    created_at: now,
    updated_at: now,
    itinerary,
  };

  const params = {
    TableName: TABLE_NAME,
    Item: tripItem,
  };

  console.log("DynamoDB PutCommand params:", params);

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

