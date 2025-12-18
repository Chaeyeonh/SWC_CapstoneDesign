const OpenAI = require("openai");

// API 키가 있을 때만 클라이언트 초기화
let client = null;
if (process.env.OPENAI_API_KEY) {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

async function analyzeMetrics({ lcp, fcp, ttfb, cls }) {
  // API 키가 없으면 null 반환
  if (!client) {
    console.warn("OpenAI API key not set. Skipping AI analysis.");
    return null;
  }

  const prompt = `
  다음은 웹 성능 측정값입니다.

  - LCP: ${lcp} ms
  - FCP: ${fcp} ms
  - TTFB: ${ttfb} ms
  - CLS: ${cls}

  이 수치를 기반으로 다음을 포함한 분석 리포트를 작성해줘:

  1) 현재 수치가 좋은지, 보통인지, 나쁜지 평가
  2) 성능 저하 원인 후보
  3) 실제 개선 조치 5개
  4) UX 관점 종합 의견
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error.message);
    return null;
  }
}

module.exports = { analyzeMetrics };
