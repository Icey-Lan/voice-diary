// AI 服务配置
export const AI_CONFIG = {
  zhipu: {
    apiKey: process.env.ZHIPU_API_KEY || '',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: 'https://api.deepseek.com/v1/',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  },
} as const

// 验证配置
export function validateAIConfig() {
  const missing: string[] = []
  if (!AI_CONFIG.zhipu.apiKey) missing.push('ZHIPU_API_KEY')
  if (!AI_CONFIG.deepseek.apiKey) missing.push('DEEPSEEK_API_KEY')

  if (missing.length > 0) {
    console.warn('Missing AI API keys:', missing.join(', '))
  }

  return missing.length === 0
}

// API请求数据类型
interface ZhipuRequestData {
  model?: string;
  messages?: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  [key: string]: unknown;
}

interface DeepSeekRequestData {
  model?: string;
  messages?: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  [key: string]: unknown;
}

// 智谱 GLM API 调用
export async function callZhipuAPI(endpoint: string, data: ZhipuRequestData) {
  const response = await fetch(`${AI_CONFIG.zhipu.baseURL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.zhipu.apiKey}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Zhipu API error: ${response.status} ${errorText}`)
  }

  return response.json()
}

// DeepSeek API 调用
export async function callDeepSeekAPI(endpoint: string, data: DeepSeekRequestData) {
  const response = await fetch(`${AI_CONFIG.deepseek.baseURL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.deepseek.apiKey}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepSeek API error: ${response.status} ${errorText}`)
  }

  return response.json()
}

// 智谱聊天 API (使用 glm-4-flash 模型)
export async function callZhipuChat(messages: Array<{ role: string; content: string }>) {
  return callZhipuAPI('chat/completions', {
    model: 'glm-4-flash',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
    stream: false,
  })
}
