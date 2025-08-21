const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.chatWithGPT = async (messages) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', 
    messages
  });
  return response.choices?.[0]?.message?.content || '';
};