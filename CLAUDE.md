# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI语音日记本 (AI Voice Diary) is a full-stack Next.js application that allows users to record their daily life through voice conversations with AI, which then generates beautifully formatted diary entries in a retro notebook style.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Development server (may have Turbopack permission issues on macOS)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code (TypeScript + ESLint)
npm run lint
```

### Environment Setup
1. Copy `.env.local.example` to `.env.local`
2. Configure required API keys:
   - `ZHIPU_API_KEY` - 智谱GLM for speech-to-text (ASR) and text-to-speech (TTS)
   - `DEEPSEEK_API_KEY` - DeepSeek for chat and diary generation
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL (planned feature)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (planned feature)

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 16.1.1 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 + Shadcn/UI components
- **State Management**: Zustand
- **AI Services**: Multi-provider architecture (DeepSeek primary, Gemini fallback)
- **Database**: Supabase integration planned (PostgreSQL)

### Key Architectural Patterns

#### 1. AI Service Abstraction Layer
The application uses a multi-provider AI architecture with automatic fallback:
- Primary: DeepSeek for chat and diary generation
- Speech: 智谱GLM for both speech-to-text (ASR) and text-to-speech (TTS)
  - ASR Model: `glm-4.7` (audio transcriptions)
  - TTS Model: `glm-tts` (text-to-speech synthesis)

All AI calls are routed through `/src/lib/ai-service.ts` which provides:
- Configuration management via `AI_CONFIG`
- Type-safe API interfaces (`ZhipuRequestData`, `DeepSeekRequestData`)
- Error handling and validation

#### 2. Prompt-Driven AI Interaction
Core AI behavior is controlled by prompts in `/src/lib/prompts.ts`:
- `getChatPrompt()` - Context-aware conversation prompts based on focus type
- `DIARY_GENERATION_PROMPT` - Strict rules for diary generation (no fabrication)
- `getGreetingMessage()` - Focus-specific greeting messages

Important constraint: The diary generation prompt enforces **no fabrication** - AI must only use information explicitly mentioned in conversations.

#### 3. Voice Processing Pipeline
1. **Client-side**: `VoiceRecorder` component uses Web Speech API for browser-based speech recognition
2. **Server-side**: `/api/speech/stt` route uses 智谱GLM API for accurate Chinese speech recognition
3. **Real-time**: `useGeminiLive` hook provides WebSocket-based live voice chat

#### 4. State Management Structure
Zustand stores in `/src/store/`:
- `conversationStore.ts` - Manages chat messages and session state
- `preferencesStore.ts` - User preferences and API keys (with persistence)
- `diaryStore.ts` - Diary entries and gallery state

#### 5. API Route Design
Next.js App Router API routes in `/src/app/api/`:
- `/chat/` - Main conversation endpoint using DeepSeek
- `/diary/generate/` - Diary generation with strict prompt enforcement
- `/speech/stt/` - Speech-to-text using 智谱GLM-4.7 ASR
- `/speech/tts/` - Text-to-speech using 智谱GLM-TTS
- `/live-chat/` - Real-time voice chat WebSocket endpoint

### File Structure Conventions

#### Type Safety
- All TypeScript types are centralized in `/src/types/index.ts`
- API request/response types follow consistent naming (`ChatRequest`, `ChatResponse`)
- Window extensions for browser APIs are declared using `declare global`

#### Component Organization
- Reusable UI components in `/src/components/ui/` (Shadcn/UI based)
- Feature components in `/src/components/` (VoiceRecorder, ChatMessage, etc.)
- All components use `"use client"` directive when needed

#### Styling Approach
- Global styles in `/src/app/globals.css` with retro notebook theme
- Tailwind CSS utility classes throughout
- Custom animations and effects defined in global CSS

## Common Development Tasks

### Adding a New AI Service Provider
1. Add configuration to `AI_CONFIG` in `/src/lib/ai-service.ts`
2. Create type definitions for request/response data
3. Implement API call function following existing patterns
4. Update `/api/chat/route.ts` to include new provider in fallback chain

### Modifying AI Behavior
1. Edit prompts in `/src/lib/prompts.ts`
2. Test conversation flow with different focus types (`event`, `emotion`, `growth`, `all`)
3. Verify diary generation still follows "no fabrication" rule

### Styling Changes
1. Update global styles in `/src/app/globals.css` for theme changes
2. Modify Tailwind configuration in `tailwind.config.js` for custom colors/fonts
3. Update component-specific styles in respective `.tsx` files

### Adding New Pages
1. Create new directory in `/src/app/` with `page.tsx`
2. Follow existing layout patterns (header, main content, retro styling)
3. Add navigation links in relevant pages

## Known Issues & Workarounds

### Turbopack Permission Issues
On macOS, `npm run dev` may fail with Turbopack permission errors. Workaround:
1. Use production build for testing: `npm run build && npm start`
2. Or run with alternative Node.js configuration

### Web Speech API Limitations
The `VoiceRecorder` component relies on browser's Web Speech API which:
- Only works in Chrome and Safari
- Requires microphone permissions
- May have accuracy issues with Chinese

Production implementation uses 智谱GLM API via `/api/speech/stt` for better accuracy.

### TypeScript Strictness
The project uses strict TypeScript configuration. Common issues:
- `any` types are prohibited by ESLint (fix with proper interfaces)
- Missing dependencies in `useEffect` hooks
- Unused variables and imports

Run `npm run lint` frequently to catch these issues early.

## Testing Notes

### Manual Testing Flow
1. Start server: `npm start`
2. Access: http://localhost:3000
3. Test conversation flow: Home → Conversation → Chat → Diary Preview
4. Verify voice recording works (requires browser microphone access)
5. Check diary generation follows "no fabrication" rule

### Environment Validation
Before testing AI features, ensure:
- `.env.local` is properly configured with API keys
- `validateAIConfig()` in `ai-service.ts` returns `true`
- API endpoints return appropriate responses (not 500 errors)

## Deployment Considerations

### Build Configuration
- Next.js 16.1.1 with App Router
- Output: Static pages with dynamic API routes
- Environment variables must be set in deployment platform

### AI Service Costs
- 智谱GLM API: Charged per speech recognition and synthesis request
- DeepSeek API: Charged per token

Monitor usage and implement rate limiting if needed.

### Database Integration (Planned)
Supabase integration is planned but not yet implemented. Current state:
- Types and configuration exist
- Store structure supports user data
- Actual database calls are commented out

When implementing, update:
1. `/src/lib/supabase.ts` with actual client configuration
2. API routes to use database persistence
3. Stores to sync with database

---

# 中文版本说明

## 项目概述

AI语音日记本是一个全栈Next.js应用，用户可以通过语音与AI对话记录日常生活，AI会将对话内容生成复古手帐风格的日记卡片。

## 开发命令

### 基本命令
```bash
# 安装依赖
npm install

# 开发服务器（macOS上可能有Turbopack权限问题）
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 代码检查（TypeScript + ESLint）
npm run lint
```

### 环境配置
1. 复制 `.env.local.example` 为 `.env.local`
2. 配置必需的API密钥：
   - `ZHIPU_API_KEY` - 智谱GLM（语音转文字ASR + 文字转语音TTS）
   - `DEEPSEEK_API_KEY` - DeepSeek（对话和日记生成）
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL（计划功能）
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名密钥（计划功能）

## 架构概览

### 技术栈
- **前端**：Next.js 16.1.1（App Router）+ React 19 + TypeScript 5
- **样式**：Tailwind CSS v4 + Shadcn/UI组件
- **状态管理**：Zustand
- **AI服务**：多提供商架构（DeepSeek主用，Gemini备用）
- **数据库**：计划集成Supabase（PostgreSQL）

### 关键架构模式

#### 1. AI服务抽象层
应用使用多提供商AI架构：
- 主用：DeepSeek（对话和日记生成）
- 语音：智谱GLM（语音转文字ASR + 文字转语音TTS）
  - ASR模型：`glm-4.7`（语音识别）
  - TTS模型：`glm-tts`（语音合成）

所有AI调用都通过 `/src/lib/ai-service.ts` 路由，提供：
- 通过 `AI_CONFIG` 进行配置管理
- 类型安全的API接口（`ZhipuRequestData`、`DeepSeekRequestData`）
- 错误处理和验证

#### 2. Prompt驱动的AI交互
核心AI行为由 `/src/lib/prompts.ts` 中的prompt控制：
- `getChatPrompt()` - 基于焦点类型的上下文感知对话prompt
- `DIARY_GENERATION_PROMPT` - 日记生成的严格规则（禁止虚构）
- `getGreetingMessage()` - 焦点特定的问候消息

重要约束：日记生成prompt强制要求**禁止虚构** - AI只能使用对话中明确提到的信息。

#### 3. 语音处理管道
1. **客户端**：`VoiceRecorder` 组件使用Web Speech API进行浏览器语音识别
2. **服务器端**：`/api/speech/stt` 路由使用智谱GLM API进行准确的中文语音识别
3. **实时**：`useGeminiLive` hook提供基于WebSocket的实时语音聊天

#### 4. 状态管理结构
Zustand存储位于 `/src/store/`：
- `conversationStore.ts` - 管理聊天消息和会话状态
- `preferencesStore.ts` - 用户偏好和API密钥（带持久化）
- `diaryStore.ts` - 日记条目和画廊状态

#### 5. API路由设计
Next.js App Router API路由位于 `/src/app/api/`：
- `/chat/` - 主对话端点，使用DeepSeek
- `/diary/generate/` - 日记生成，强制执行prompt规则
- `/speech/stt/` - 使用智谱GLM-4.7 ASR的语音转文字
- `/speech/tts/` - 使用智谱GLM-TTS的文字转语音
- `/live-chat/` - 实时语音聊天WebSocket端点

### 文件结构约定

#### 类型安全
- 所有TypeScript类型集中在 `/src/types/index.ts`
- API请求/响应类型遵循一致的命名（`ChatRequest`、`ChatResponse`）
- 浏览器API的Window扩展使用 `declare global` 声明

#### 组件组织
- 可复用的UI组件在 `/src/components/ui/`（基于Shadcn/UI）
- 功能组件在 `/src/components/`（VoiceRecorder、ChatMessage等）
- 所有组件在需要时使用 `"use client"` 指令

#### 样式方法
- 全局样式在 `/src/app/globals.css`，采用复古手帐主题
- 全程使用Tailwind CSS工具类
- 自定义动画和效果在全局CSS中定义

## 常见开发任务

### 添加新的AI服务提供商
1. 在 `/src/lib/ai-service.ts` 的 `AI_CONFIG` 中添加配置
2. 为请求/响应数据创建类型定义
3. 按照现有模式实现API调用函数
4. 更新 `/api/chat/route.ts` 以包含新的提供商到降级链中

### 修改AI行为
1. 编辑 `/src/lib/prompts.ts` 中的prompt
2. 使用不同的焦点类型（`event`、`emotion`、`growth`、`all`）测试对话流程
3. 验证日记生成仍遵循"禁止虚构"规则

### 样式更改
1. 在 `/src/app/globals.css` 中更新全局样式以更改主题
2. 在 `tailwind.config.js` 中修改Tailwind配置以添加自定义颜色/字体
3. 在相应的 `.tsx` 文件中更新组件特定样式

### 添加新页面
1. 在 `/src/app/` 中创建新目录，包含 `page.tsx`
2. 遵循现有的布局模式（页眉、主内容区、复古样式）
3. 在相关页面中添加导航链接

## 已知问题和解决方案

### Turbopack权限问题
在macOS上，`npm run dev` 可能因Turbopack权限错误而失败。解决方案：
1. 使用生产构建进行测试：`npm run build && npm start`
2. 或使用替代的Node.js配置运行

### Web Speech API限制
`VoiceRecorder` 组件依赖浏览器的Web Speech API，该API：
- 仅在Chrome和Safari中工作
- 需要麦克风权限
- 中文识别可能有准确性问题

生产实现通过 `/api/speech/stt` 使用智谱GLM API以获得更好的准确性。

### TypeScript严格性
项目使用严格的TypeScript配置。常见问题：
- ESLint禁止使用 `any` 类型（使用正确的接口修复）
- `useEffect` hooks中缺少依赖项
- 未使用的变量和导入

经常运行 `npm run lint` 以尽早发现这些问题。

## 测试注意事项

### 手动测试流程
1. 启动服务器：`npm start`
2. 访问：http://localhost:3000
3. 测试对话流程：首页 → 对话选择 → 聊天 → 日记预览
4. 验证语音录制工作（需要浏览器麦克风访问权限）
5. 检查日记生成是否遵循"禁止虚构"规则

### 环境验证
在测试AI功能之前，确保：
- `.env.local` 正确配置了API密钥
- `ai-service.ts` 中的 `validateAIConfig()` 返回 `true`
- API端点返回适当的响应（不是500错误）

## 部署注意事项

### 构建配置
- Next.js 16.1.1 带App Router
- 输出：带动态API路由的静态页面
- 必须在部署平台设置环境变量

### AI服务成本
- 智谱GLM API：按语音识别和语音合成请求计费
- DeepSeek API：按token计费

监控使用情况，如果需要则实施速率限制。

### 数据库集成（计划中）
Supabase集成已计划但尚未实现。当前状态：
- 类型和配置已存在
- 存储结构支持用户数据
- 实际的数据库调用已注释掉

实现时更新：
1. `/src/lib/supabase.ts` 使用实际的客户端配置
2. API路由使用数据库持久化
3. 存储与数据库同步