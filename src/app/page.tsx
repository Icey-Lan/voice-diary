import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="border-b border-[#c4a77d]/30 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#2c2416] handwriting">
            AI 日记本
          </h1>
          <nav className="flex gap-4">
            <Link
              href="/gallery"
              className="text-sm text-[#5c4a32] hover:text-[#8b7355] transition-colors"
            >
              日记回廊
            </Link>
            <Link
              href="/settings"
              className="text-sm text-[#5c4a32] hover:text-[#8b7355] transition-colors"
            >
              设置
            </Link>
          </nav>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* 欢迎卡片 */}
          <div className="paper-texture bg-white rounded-2xl p-8 card-shadow washi-tape text-center space-y-6">
            <div className="space-y-2">
              <div className="text-5xl">📔</div>
              <h2 className="text-2xl font-semibold text-[#2c2416]">
                你好呀
              </h2>
              <p className="text-[#5c4a32]">
                我是你的 AI 日记伙伴，<br />
                想聊聊今天发生什么了吗？
              </p>
            </div>

            {/* 开始按钮 */}
            <Link
              href="/conversation"
              className="inline-flex items-center gap-2 btn-retro px-8 py-3 text-lg"
            >
              <span>开始写日记</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            {/* 最近日记预览 */}
            <div className="pt-6 border-t border-[#c4a77d]/30">
              <p className="text-sm text-[#5c4a32]/70 mb-3">
                上次记录：3 天前
              </p>
              <div className="text-sm text-[#5c4a32]">
                点击&quot;开始写日记&quot;记录今天的点滴 ✨
              </div>
            </div>
          </div>

          {/* 功能提示 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl">🎙️</div>
              <p className="text-xs text-[#5c4a32]">语音对话</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">✍️</div>
              <p className="text-xs text-[#5c4a32]">智能生成</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">📖</div>
              <p className="text-xs text-[#5c4a32]">精美收藏</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
