const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));
const TABLE = process.env.APPLICATIONS_TABLE || 'SilverCareApplications';

// 생성
exports.createApplication = async ({ userId, policyId }) => {
  const now = new Date().toISOString();
  const item = {
    id: uuidv4(),
    userId, policyId,
    status: '준비',  
    createdAt: now, updatedAt: now,
    timeline: [{ status: '준비', at: now }]
  };
  await db.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
};

exports.updateStatus = async (id, nextStatus) => {
  const now = new Date().toISOString();
  const expr = 'SET #s = :s, updatedAt = :u ADD';
  const { Attributes } = await db.send(new UpdateCommand({
    TableName: TABLE,
    Key: { id },
    UpdateExpression: 'SET #s = :s, updatedAt = :u',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':s': nextStatus, ':u': now },
    ReturnValues: 'ALL_NEW'
  }));
  return Attributes;
};

exports.listByUser = async (userId) => {
  const { Items = [] } = await db.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'user-index',  
    KeyConditionExpression: 'userId = :u',
    ExpressionAttributeValues: { ':u': userId },
    ScanIndexForward: false
  }));
  return Items;
};