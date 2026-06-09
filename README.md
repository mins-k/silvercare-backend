# SilverCare Backend

## 프로젝트 소개
노인 복지 정책 추천 및 음성 기반 상담 백엔드 서비스입니다.

## 기술 스택

- Backend: Node.js, Express
- Database: AWS DynamoDB
- AI: OpenAI API
- Voice: AWS Polly, AWS Transcribe

## 주요 기능
- 사용자 프로필 기반 복지 정책 추천
- FAQ 응답
- 음성 입력 STT
- 음성 출력 TTS
- 상담형 챗봇

## Architecture
- API 서버: Node.js(Express)
- AI: OpenAI(Chat) → 답변/스몰톡 + 태깅- 음성: AWS Transcribe(STT, 업로드형) / AWS Polly(TTS, S3 또는 로컬 폴백)
- 데이터: DynamoDB(프로필/채팅/신청), JSON 파일(정책 카탈로그 – 로컬 데모용)
- 파일 저장: S3(옵션) + public/ 정적 서빙
- 보안: Admin API는 헤더 x-admin-token(환경변수 ADMIN_TOKEN)

## DEMO SCRIPT
1. Postman POST /api/profile(hongildong)
2. GET /api/match?userId=hongildong → 상위 정책 확인
3. POST /api/chat(“받을 수 있는 정책?” / tts:true) → mp3 링크 재생
4. POST /api/voice-turn(음성 파일 업로드) → STT→답변 음성 (준비→제출→확인)
5. Admin POST/PATCH/DELETE /api/admin/policies(헤더 x-admin-token) → 정책 변경 즉시 반영
