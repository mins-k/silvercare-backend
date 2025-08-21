const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');

const region = process.env.AWS_REGION || 'ap-northeast-2';
const raw = new DynamoDBClient({ region });
const db = DynamoDBDocumentClient.from(raw, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE = process.env.CHATS_TABLE || 'SilverCareChats';
const TS_TYPE = (process.env.CHATS_TS_TYPE || 'S').toUpperCase();

function defaultSessionId() {
  return new Date().toISOString().slice(0, 10); 
}

/**
 * @param {string} userId
 * @param {'user'|'assistant'} role
 * @param {string} content
 * @param {{ sessionId?: string, ttlDays?: number }} [opts]
 */
async function appendMessage(userId, role, content, opts = {}) {
  const tsNum = Date.now();
  const ts = TS_TYPE === 'N' ? tsNum : String(tsNum); 

  const item = {
    userId,                          
    ts,                                
    role,                              
    text: String(content).slice(0, 8000),
    sessionId: opts.sessionId || defaultSessionId(),
    createdAt: new Date(tsNum).toISOString(),
    ttl:
      opts.ttlDays != null
        ? Math.floor((tsNum + opts.ttlDays * 86400_000) / 1000) 
        : undefined,
  };

  await db.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

/**
 * 최근 히스토리 조회 (오래된→최신 순)
 * @param {string} userId
 * @param {number} limit
 * @param {{ sessionId?: string }} [opts]
 */
async function getHistory(userId, limit = 10, opts = {}) {
  const { Items = [] } = await db.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId },
      ScanIndexForward: false, 
      Limit: limit,
    })
  );

  const sessionId = opts.sessionId;
  const filtered = sessionId ? Items.filter((i) => i.sessionId === sessionId) : Items;


  return filtered
    .sort((a, b) => {
      const av = TS_TYPE === 'N' ? Number(a.ts) : Number(String(a.ts));
      const bv = TS_TYPE === 'N' ? Number(b.ts) : Number(String(b.ts));
      return av - bv;
    })
    .map((i) => ({
      role: i.role,
      content: i.text,
      ts: i.ts,
      createdAt: i.createdAt,
      sessionId: i.sessionId,
    }));
}

module.exports = { appendMessage, getHistory };