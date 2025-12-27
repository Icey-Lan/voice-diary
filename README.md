# AI 语音日记本

一款温暖的 AI 日记应用，通过语音对话记录生活，生成精美的复古手帐风格日记卡片。

## 功能特性

- 🎙️ **语音对话** - 通过语音与 AI 自然对话，记录生活点滴
- ✍️ **智能生成** - AI 将对话内容整理成温暖的散文式日记
- 📖 **日记回廊** - 时间轴展示，复古手帐风格卡片收藏
- ⚙️ **个性化配置** - 可配置对话焦点、语音偏好等

## 技术栈

- **前端框架**: Next.js 16 (App Router) + React 19
- **UI 组件**: Shadcn/UI + Tailwind CSS v4
- **状态管理**: Zustand
- **AI 服务**:
  - DeepSeek (对话、日记生成)
  - 智谱 GLM (语音识别、语音合成)
- **数据库**: Supabase (PostgreSQL)

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
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

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

## 项目结构

```
src/
├── app/                      # Next.js App Router 页面
│   ├── page.tsx             # 首页
│   ├── conversation/        # 对话相关页面
│   ├── gallery/             # 日记回廊
│   ├── settings/            # 设置页面
│   ├── api/                 # API 路由
│   ├── layout.tsx           # 根布局
│   └── globals.css          # 全局样式（复古手帐风格）
├── components/              # React 组件
│   ├── VoiceRecorder.tsx   # 语音录音组件
│   └── ChatMessage.tsx     # 聊天消息组件
├── lib/                    # 工具函数和配置
│   ├── ai-service.ts       # AI 服务配置
│   ├── prompts.ts          # AI Prompt 模板
│   ├── supabase.ts         # Supabase 客户端
│   └── utils.ts            # 工具函数
├── store/                  # Zustand 状态管理
│   ├── conversationStore.ts
│   ├── diaryStore.ts
│   └── preferencesStore.ts
└── types/                  # TypeScript 类型定义
    └── index.ts
```

## 使用流程

1. **开始对话** - 选择对话焦点（记录事件/分享感受/成长感悟/全面回顾）
2. **语音交流** - 点击麦克风说话，AI 会引导对话
3. **生成日记** - 对话结束后，AI 生成散文式日记
4. **保存收藏** - 保存到日记回廊，随时查看

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/chat` | POST | AI 对话接口 |
| `/api/diary/generate` | POST | 生成日记 |
| `/api/speech/stt` | POST | 语音转文字 |
| `/api/speech/tts` | POST | 文字转语音 |

## 设计特色

- **复古手帐风格**: 纸张纹理、手写字体、和纸胶带装饰
- **温暖配色**: 米色、棕色、墨绿色等自然色调
- **流畅动画**: 墨水扩散、淡入淡出等细腻效果

## 后续计划

- [ ] Supabase 数据库集成
- [ ] 用户认证系统
- [ ] 日记卡片配图功能
- [ ] 地点标记
- [ ] 背景音乐
- [ ] 导出 PDF 功能
- [ ] iOS 应用打包

## License

MIT
