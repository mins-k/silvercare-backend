const fs = require('fs');
const path = require('path');
const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const region = process.env.AWS_REGION || 'ap-northeast-2';
const client = new PollyClient({ region });
const s3 = new S3Client({ region });
exports.synthesizeReply = async (replyText = '') => {
  const text = String(replyText).replace(/\s+/g, ' ').slice(0, 2800);
  const synth = new SynthesizeSpeechCommand({
    OutputFormat: 'mp3',
    Text: text,
    VoiceId: process.env.POLLY_VOICE || 'Seoyeon',
    LanguageCode: 'ko-KR'
  });

  const { AudioStream } = await client.send(synth);

  const chunks = [];
  for await (const c of AudioStream) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  const buf = Buffer.concat(chunks);

  const bucket = process.env.MEDIA_BUCKET;  
  const key = `voice/${Date.now()}.mp3`;
  if (bucket) {
    try {
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buf,
        ContentType: 'audio/mpeg'
      }));
      const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
      const signed = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: bucket, Key: key, ResponseContentType: 'audio/mpeg' }),
        { expiresIn: 60 * 5 }
      );
      return signed;
    } catch (e) {
      console.error('Polly->S3 업로드 실패, 로컬로 폴백:', e.message);
    }
  }
  const filename = `${Date.now()}.mp3`;
  const filePath = path.join(__dirname, '../../public', filename);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buf);
  const port = process.env.PORT || 8080;
  return `http://localhost:${port}/${filename}`;
};