# AI 语音日记本

一款温暖的 AI 日记应用，通过语音对话记录生活，自动生成精美的散文式日记卡片。

## 功能特性

- 🎙️ **语音对话** - 通过语音与 AI 自然对话，记录生活点滴
- 🎯 **对话引导** - 多种对话焦点（记录事件/分享感受/成长感悟/全面回顾）
- ✍️ **智能生成** - AI 将对话内容整理成温暖的散文式日记
- 📖 **日记回廊** - 卡片式展示，展开/收起查看详情
- 🎨 **现代设计** - 扁平化设计风格，活力渐变配色
- ⚙️ **个性化配置** - 可配置对话焦点、语音偏好、API Keys

## 技术栈

- **前端框架**: Next.js 16.1.1 (App Router) + React 19
- **UI 组件**: Tailwind CSS v4 + lucide-react 图标
- **状态管理**: Zustand (with persist middleware)
- **AI 服务**:
  - DeepSeek (对话、日记生成)
  - 智谱 GLM-4.7 (语音识别、语音合成)
  - Gemini 2.5 Flash (备用)
- **数据存储**: localStorage (客户端)

## 开始使用

### 1. 安装依赖

```bash
cd ai-diary-app
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，并填入你的 API Keys：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
# AI Services
ZHIPU_API_KEY=your_zhipu_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── app/                      # Next.js App Router 页面
│   ├── page.tsx              # 首页
│   ├── conversation/         # 对话相关页面
│   │   ├── page.tsx          # 选择对话焦点
│   │   ├── chat/             # 聊天界面
│   │   └── preview/          # 预览和保存日记
│   ├── gallery/              # 日记回廊
│   ├── settings/             # 设置页面
│   ├── api/                  # API 路由
│   │   ├── chat/             # AI 对话
│   │   ├── diary/            # 日记生成
│   │   ├── live-chat/        # 实时语音对话
│   │   └── speech/           # 语音服务
│   │       ├── stt/          # 语音转文字
│   │       └── tts/          # 文字转语音
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── components/               # React 组件
│   ├── icons/                # 图标组件（lucide-react）
│   ├── VoiceRecorder.tsx     # 语音录音组件
│   ├── ChatMessage.tsx       # 聊天消息组件
│   └── LiveVoiceChat.tsx     # 实时语音对话组件
├── lib/                      # 工具函数和配置
│   ├── ai-service.ts         # AI 服务配置
│   ├── prompts.ts            # AI Prompt 模板
│   └── utils.ts              # 工具函数
├── store/                    # Zustand 状态管理
│   ├── conversationStore.ts  # 对话状态
│   ├── diaryStore.ts         # 日记状态
│   └── preferencesStore.ts   # 用户偏好设置
└── types/                    # TypeScript 类型定义
    └── index.ts
```

## 使用流程

1. **选择焦点** - 选择对话主题（记录事件/分享感受/成长感悟/全面回顾）
2. **语音交流** - 点击麦克风说话，AI 会根据焦点引导对话
3. **生成日记** - 对话结束后，点击"完成对话"生成日记
4. **预览保存** - 预览生成的日记，可重新生成或保存到日记回廊
5. **查看回廊** - 在日记回廊中查看所有保存的日记

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/chat` | POST | AI 对话接口 |
| `/api/live-chat` | POST | 实时语音对话 |
| `/api/diary/generate` | POST | 生成日记 |
| `/api/speech/stt` | POST | 语音转文字（智谱 GLM-4.7 ASR） |
| `/api/speech/tts` | POST | 文字转语音（智谱 GLM-TTS） |

## 设计特色

- **现代扁平化设计**: 干净简洁的界面，无多余装饰
- **活力渐变配色**: 靛蓝+紫色主色调，营造温暖氛围
- **扁平化图标**: 使用 lucide-react 图标库，统一视觉语言
- **手写字体点缀**: 在标题和特殊强调处使用手写字体
- **流畅动画**: 淡入淡出、卡片展开等细腻效果

## 心情标签

平静 | 开心 | 忧郁 | 感激 | 疲惫 | 期待 | 焦虑 | 满足 | 思考 | 温暖

## 天气选项

晴天 | 多云 | 阴天 | 小雨 | 大雨 | 雪 | 雾

## 后续计划

- [ ] Supabase 数据库集成（数据云端同步）
- [ ] 用户认证系统
- [ ] 日记卡片配图功能
- [ ] 地点标记
- [ ] 背景音乐
- [ ] 导出 PDF 功能
- [ ] iOS/Android 应用打包
- [ ] 多语言支持

## 常见问题

### 1. 语音功能无法使用？

请确保：
- 已配置 `ZHIPU_API_KEY` 环境变量
- 智谱 API 账户有足够余额
- 浏览器已授予麦克风权限

### 2. 日记生成失败？

检查：
- `DEEPSEEK_API_KEY` 是否正确配置
- DeepSeek API 账户状态是否正常
- 网络连接是否正常

### 3. 如何清除本地数据？

在浏览器开发者工具中执行：
```javascript
localStorage.clear()
```

或在设置页面点击"清除所有数据"。

## 开发团队

本项目使用 [Claude Code](https://claude.com/claude-code) 辅助开发。

## License

MIT
