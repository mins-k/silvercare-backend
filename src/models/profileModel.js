const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const rawClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const db = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: { removeUndefinedValues: true }
});

const TABLE = process.env.DDB_TABLE; 

/**
 * saveProfile(profile)
 * - canonical profile 저장 (영문 키)
 */
exports.saveProfile = async (profile) => {
  const item = {
    id: profile.id,                // PK
    birthDate: profile.birthDate,
    age: profile.age,
    address: profile.address,
    householdType: profile.householdType,
    income: profile.income,
    healthStatus: profile.healthStatus,
    tags: profile.tags || [],
    createdAt: new Date().toISOString()
  };

  await db.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
};


exports.getProfile = async (userId) => {
  const { Item } = await db.send(new GetCommand({
    TableName: TABLE,
    Key: { id: userId }
  }));
  return Item || null;
};