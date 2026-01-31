// Gemini API 封装
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function chatWithGemini(
  apiKey: string,
  messages: GeminiMessage[],
  systemPrompt?: string
): Promise<string> {
  const contents = messages.map(m => ({
    role: m.role,
    parts: m.parts
  }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  if (systemPrompt) {
    body.systemInstruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '抱歉，我没能理解你的意思...';
}

// 生成排程的专用函数
export async function generateScheduleWithAI(
  apiKey: string,
  tasks: { title: string; estimatedMinutes: number; priority: string; deadline?: string }[],
  settings: { usualWakeTime: string; usualBedTime: string; maxFocusMinutes: number; breakMinutes: number; personalNotes: string },
  existingSchedule?: string,
  userFeedback?: string
): Promise<string> {
  const today = new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });
  
  let prompt = `你是一个温柔、善解人意的生活助手。今天是${today}。

用户的作息习惯：
- 通常起床时间：${settings.usualWakeTime}
- 通常睡觉时间：${settings.usualBedTime}
- 单次最长专注时间：${settings.maxFocusMinutes} 分钟
- 休息时长：${settings.breakMinutes} 分钟
${settings.personalNotes ? `- 个人备注：${settings.personalNotes}` : ''}

待办任务：
${tasks.map(t => `- ${t.title}（预计 ${t.estimatedMinutes} 分钟，优先级：${t.priority}${t.deadline ? `，截止：${t.deadline}` : ''}）`).join('\n')}

重要原则：
1. 不要把长任务连续安排，用户难以保持长时间专注
2. 每个任务块不超过 ${settings.maxFocusMinutes} 分钟
3. 任务之间要安排休息
4. 尊重用户的心理健康，不要安排得太满
5. 语气要温柔、鼓励

`;

  if (existingSchedule && userFeedback) {
    prompt += `
之前生成的安排：
${existingSchedule}

用户的反馈：${userFeedback}

请根据用户的反馈调整安排。`;
  } else {
    prompt += `
请为用户生成今天的安排，格式如下：
⏰ 08:00 - 08:30 | 起床、早餐
📚 09:00 - 09:45 | 任务名称
☕ 09:45 - 10:00 | 休息
...

生成安排后，温柔地询问用户觉得这样可以吗，有什么想调整的。`;
  }

  return chatWithGemini(apiKey, [
    { role: 'user', parts: [{ text: prompt }] }
  ]);
}
