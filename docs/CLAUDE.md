# AI 语音日记本 - Claude 项目说明

> 这是给 Claude AI 助手的项目说明文档，帮助你更好地理解项目上下文。

## 项目概述

这是一个 Next.js 16 + React 19 构建的 AI 语音日记应用。用户通过语音对话记录生活，AI 自动生成散文式日记卡片。

**GitHub**: [Icey-Lan/voice-diary](https://github.com/Icey-Lan/voice-diary)

## 快速导航

### 核心文件
- [README.md](../README.md) - 项目说明和快速开始
- [PRD.md](./PRD.md) - 产品需求文档
- `.env.local` - 环境变量配置

### 关键目录
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页
│   ├── conversation/      # 对话流程
│   ├── gallery/           # 日记回廊
│   ├── settings/          # 设置
│   └── api/               # API 端点
├── components/            # React 组件
├── store/                 # Zustand 状态管理
├── lib/                   # 工具函数
└── types/                 # TypeScript 类型
```

## 技术栈

### 前端
- **框架**: Next.js 16.1.1 (App Router)
- **UI 库**: React 19 + Tailwind CSS v4
- **图标**: lucide-react (扁平化图标)
- **状态管理**: Zustand with persist
- **类型系统**: TypeScript 5 (strict mode)

### 后端
- **API**: Next.js API Routes
- **AI 服务**:
  - DeepSeek Chat (对话、日记生成)
  - 智谱 GLM-4.7 (语音识别、合成)
  - Gemini 2.5 Flash (备用)

### 存储
- **当前**: localStorage (客户端)
- **计划**: Supabase (云端同步)

## 设计系统

### 配色方案
```css
/* 主色调 - 活力渐变 */
--primary: #6366f1        /* 靛蓝 */
--primary-light: #818cf8  /* 浅靛蓝 */
--secondary: #ec4899      /* 粉红 */
--accent: #f59e0b         /* 琥珀 */

/* 渐变色 */
--gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)
--gradient-secondary: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)
```

### UI 组件
- **按钮**: `.btn-primary` - 渐变背景，圆角，hover 效果
- **卡片**: `.card-flat` - 扁平化卡片，渐变背景
- **图标**: `<Icon name="..." />` - 使用 lucide-react

### 字体
- 默认: 系统字体
- 手写字体: "Ma Shan Zheng" (用于标题)

## 核心功能

### 1. 对话引导 (`/conversation`)
用户选择对话焦点：
- `event` - 记录事件
- `emotion` - 分享感受
- `growth` - 成长感悟
- `all` - 全面回顾

### 2. 聊天界面 (`/conversation/chat`)
两种模式：
- **经典模式**: 点击麦克风说话，发送后获得回复
- **实时模式**: 长按麦克风说话，实时转文字

### 3. 日记生成 (`/api/diary/generate`)
AI 分析对话内容，生成包含：
- 天气 (weather)
- 心情标签 (moodTags: 2-3 个)
- 散文式正文 (content: 200-500 字)

**重要**: 日记内容只显示纯文本，weather 和 mood 信息仅显示在卡片头部。

### 4. 日记回廊 (`/gallery`)
- 时间倒序展示所有日记
- 点击展开/收起查看详情
- 从 localStorage 加载数据
- 监听 `diariesUpdated` 事件实时更新

## API 端点

### POST `/api/chat`
**描述**: AI 对话接口

**请求**:
```json
{
  "messages": [
    { "role": "user", "content": "你好" }
  ],
  "focus": "all"
}
```

**响应**:
```json
{
  "content": "你好呀～今天过得怎么样？"
}
```

### POST `/api/diary/generate`
**描述**: 生成日记

**请求**:
```json
{
  "conversation": [
    { "role": "user", "content": "今天天气不错" }
  ],
  "focus": "all"
}
```

**响应**:
```json
{
  "weather": "晴天",
  "moodTags": ["平静", "开心"],
  "content": "今天的阳光很好..."
}
```

### POST `/api/speech/stt`
**描述**: 语音转文字（智谱 GLM-4.7 ASR）

**请求**:
```json
{
  "audio": "base64_encoded_audio"
}
```

### POST `/api/speech/tts`
**描述**: 文字转语音（智谱 GLM-TTS）

**请求**:
```json
{
  "text": "你好呀",
  "speed": 1.0
}
```

## 数据模型

### Diary (日记)
```typescript
interface Diary {
  id: string              // UUID
  user_id: string         // 用户 ID
  date: string            // 日期 (YYYY-MM-DD)
  weather: string         // 天气
  moodTags: string[]      // 心情标签
  content: string         // 日记正文（纯文本）
  created_at: string      // 创建时间
}
```

### Message (消息)
```typescript
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}
```

### Session (会话)
```typescript
interface Session {
  id: string
  focus: DialogueFocus
  startTime: string
  messages: Message[]
}
```

## 心情标签

```typescript
const MOOD_TAGS = [
  { label: "平静", icon: "leaf", color: "#10b981" },
  { label: "开心", icon: "sun", color: "#fbbf24" },
  { label: "忧郁", icon: "cloud-rain", color: "#64748b" },
  { label: "感激", icon: "heart", color: "#ec4899" },
  { label: "疲惫", icon: "moon", color: "#8b5cf6" },
  { label: "期待", icon: "sparkles", color: "#f59e0b" },
  { label: "焦虑", icon: "zap", color: "#ef4444" },
  { label: "满足", icon: "smile", color: "#6366f1" },
  { label: "思考", icon: "lightbulb", color: "#f59e0b" },
  { label: "温暖", icon: "sun", color: "#f97316" }
]
```

## 天气选项

```typescript
const WEATHER_OPTIONS = [
  { label: "晴天", icon: "sun", color: "#fbbf24" },
  { label: "多云", icon: "cloud-sun", color: "#94a3b8" },
  { label: "阴天", icon: "cloud", color: "#64748b" },
  { label: "小雨", icon: "cloud-drizzle", color: "#60a5fa" },
  { label: "大雨", icon: "cloud-rain", color: "#3b82f6" },
  { label: "雪", icon: "snowflake", color: "#a5b4fc" },
  { label: "雾", icon: "cloud-fog", color: "#94a3b8" }
]
```

## 常见任务

### 添加新的心情标签
编辑 `src/types/index.ts` 中的 `MOOD_TAGS` 数组。

### 修改 AI Prompt
编辑 `src/lib/prompts.ts` 中的 `DIARY_GENERATION_PROMPT` 或 `getChatPrompt` 函数。

### 更新主题颜色
编辑 `src/app/globals.css` 中的 CSS 变量。

### 添加新页面
1. 在 `src/app/` 下创建新的路由目录
2. 添加 `page.tsx` 文件
3. 遵循现有页面结构

### 调试 API
检查服务器日志：
```bash
npm run dev
# 查看控制台输出
```

## 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 避免使用 `any` 类型
- 组件使用函数式组件 + Hooks
- 使用 lucide-react 图标，不使用 emoji

### Git 提交
遵循约定式提交：
```
type(scope): description

# 示例
feat: add user authentication
fix: resolve diary parsing issue
docs: update README with new features
```

### 测试
```bash
# 开发服务器
npm run dev

# 构建测试
npm run build

# 类型检查
npm run type-check
```

## 已知问题

### 1. 智谱 TTS API 余额不足
如果智谱账户余额不足，TTS 功能会失败。可以考虑：
- 充值智谱账户
- 使用浏览器 SpeechSynthesis API 作为备选
- 在设置中禁用语音功能

### 2. 日记内容解析
有时 AI 可能不严格遵循 Prompt 格式。已实现多层解析逻辑：
1. 标准格式解析（`---` 分隔符）
2. 行-by行备用解析
3. 最终清理（移除残留的 weather/mood 行）

## 未来计划

- [ ] Supabase 数据库集成
- [ ] 用户认证
- [ ] 日记编辑
- [ ] 搜索和筛选
- [ ] 日记配图
- [ ] 导出 PDF
- [ ] 移动应用

## 联系方式

- **GitHub**: [Icey-Lan/voice-diary](https://github.com/Icey-Lan/voice-diary)
- **开发者**: Icey-Lan

---

*本文档由 Claude Code 维护，最后更新: 2025-01-06*
