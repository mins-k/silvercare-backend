const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));
const TABLE = process.env.DDB_TABLE;

exports.saveUserRecord = async ({ rawTranscript, name, dob }) => {
  const item = {
    id: Date.now().toString(),
    rawTranscript, name, dob,
    createdAt: new Date().toISOString()
  };
  await db.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
};