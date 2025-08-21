const fetch = require('node-fetch');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} = require('@aws-sdk/client-transcribe');

const REGION = process.env.AWS_REGION;
const UPLOAD_BUCKET = process.env.TRANSCRIBE_BUCKET;

const s3 = new S3Client({ region: REGION });
const txClient = new TranscribeClient({ region: REGION });

/**
 * 1) 업로드된 오디오를 S3에 저장
 * 2) AWS Transcribe Job 시작
 * 3) presigned TranscriptFileUri를 받아 JSON 파싱 → 텍스트 반환
 */
exports.transcribeAudioFile = async (file) => {
  const key = `uploads/${Date.now()}-${file.originalname}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: UPLOAD_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  const jobName = `job-${Date.now()}`;
  await txClient.send(
    new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: 'ko-KR',
      Media: { MediaFileUri: `s3://${UPLOAD_BUCKET}/${key}` },
      // MediaFormat: 'mp3',
    })
  );

  const maxTries = 12;
  for (let i = 0; i < maxTries; i++) {
    const waitMs = Math.min(1000 * Math.pow(1.7, i), 10000);
    await new Promise((r) => setTimeout(r, waitMs));

    const { TranscriptionJob } = await txClient.send(
      new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
    );

    const status = TranscriptionJob.TranscriptionJobStatus;
    if (status === 'COMPLETED') {
      const uri = TranscriptionJob.Transcript?.TranscriptFileUri;
      if (!uri) throw new Error('TranscriptFileUri 없음');
      const resp = await fetch(uri);
      const data = await resp.json();
      return (data.results?.transcripts || [])
        .map((t) => t.transcript)
        .join('\n');
    }
    if (status === 'FAILED') {
      throw new Error('Transcribe job failed');
    }
  }

  throw new Error('Transcribe timed out');
};

exports.parseFromText = (transcript) => {
  const dateMatch = transcript.match(
    /(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/
  );
  const nameMatch = transcript.match(/이름(?:은|:)\s*([^,，\n]+)/);

  let dob = '알수없음';
  if (dateMatch) {
    const [, Y, M, D] = dateMatch;
    dob = `${Y}-${String(M).padStart(2, '0')}-${String(D).padStart(2, '0')}`;
  }

  return {
    rawTranscript: transcript,
    name: nameMatch?.[1].trim() || '알수없음',
    dob,
  };
};