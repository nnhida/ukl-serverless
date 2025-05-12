const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { randomUUID } = require('crypto');

const baseClient = new DynamoDBClient({});
const ddbClient = DynamoDBDocumentClient.from(baseClient);
const s3Client = new S3Client();

const TableName = process.env.TABLE_NAME;
const BucketName = process.env.BUCKET_NAME;

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
};

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'CORS preflight success' }),
      };
    }

    if (event.httpMethod === 'GET') {
      console.log('GET request received');

      try {
        const { Items = [] } = await ddbClient.send(new ScanCommand({ TableName }));
        console.log('Items retrieved from DynamoDB:', Items);

        const itemsWithUrls = await Promise.all(
          Items.map(async (item) => {
            console.log('Processing item:', item);

            if (!item?.s3key || typeof item.s3key !== 'string') {
              console.warn(`Item ${item.id} missing or invalid s3key:`, item.s3key);
              return { ...item, imageUrl: null };
            }

            try {
              console.log(`Generating signed URL for key: ${item.s3key}`);
              const url = await getSignedUrl(
                s3Client,
                new GetObjectCommand({
                  Bucket: BucketName,
                  Key: item.s3key,
                }),
                { expiresIn: 604800 }
              );

              console.log(`Signed URL for ${item.s3key}: ${url}`);
              return { ...item, imageUrl: url };
            } catch (err) {
              console.error(`Failed to generate signed URL for ${item.s3key}`, err);
              return { ...item, imageUrl: null };
            }
          })
        );

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(itemsWithUrls),
        };
      } catch (err) {
        console.error('GET request failed:', err);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Failed to retrieve items.' }),
        };
      }
    }

    if (event.httpMethod === 'POST') {
      if (!event.body) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing request body' }),
        };
      }

      const body = JSON.parse(event.body);
      const { name, feedback, filename, contentType, fileData } = body;

      if (!name || !feedback || !filename || !fileData || !contentType) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing required fields' }),
        };
      }

      const feedbackId = randomUUID();
      const s3Key = `${feedbackId}_${filename}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BucketName,
          Key: s3Key,
          Body: Buffer.from(fileData, 'base64'),
          ContentType: contentType,
        })
      );

      const item = {
        id: feedbackId,
        name: String(name),
        feedback: String(feedback),
        filename: String(filename),
        s3key: s3Key,
        timestamp: new Date().toISOString(),
      };

      await ddbClient.send(
        new PutCommand({
          TableName,
          Item: item,
        })
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Feedback stored.', key: s3Key }),
      };
    }

    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Unhandled error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
