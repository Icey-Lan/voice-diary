import Link from "next/link"
import { Diary } from "@/types"

// 模拟数据 - 后续从数据库获取
const mockDiaries: Diary[] = [
  {
    id: "1",
    user_id: "local-user",
    date: "2024-12-27",
    weather: "晴天",
    moodTags: ["平静", "温暖"],
    content: "今天的阳光格外温柔，我坐在窗边，看着光线一点点移动，心里有种说不出的宁静...",
    created_at: "2024-12-27T10:30:00Z"
  },
  {
    id: "2",
    user_id: "local-user",
    date: "2024-12-26",
    weather: "多云",
    moodTags: ["思考", "期待"],
    content: "和老朋友聊了很久，关于未来的对话让我重新审视了一些事情...",
    created_at: "2024-12-26T20:15:00Z"
  }
]

export default function GalleryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="border-b border-[#c4a77d]/30 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-[#5c4a32] hover:text-[#8b7355] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-[#2c2416]">
            日记回廊
          </h1>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 空状态或日记列表 */}
          {mockDiaries.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-5xl">📔</div>
              <h2 className="text-xl font-semibold text-[#2c2416]">
                还没有日记
              </h2>
              <p className="text-[#5c4a32]">
                开始记录第一篇日记吧
              </p>
              <Link
                href="/conversation"
                className="inline-block btn-retro px-6 py-2"
              >
                开始写日记
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {mockDiaries.map((diary, index) => (
                <div
                  key={diary.id}
                  className="paper-texture bg-white rounded-2xl p-6 card-shadow fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 卡片头部 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-sm text-[#5c4a32]/70">
                      <span>{diary.date}</span>
                      <span>·</span>
                      <span>{diary.weather}</span>
                    </div>
                    <div className="flex gap-1">
                      {diary.moodTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-[#f4f1ea] text-[#5c4a32]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 日记内容 */}
                  <div className="handwriting text-[#2c2416] leading-relaxed">
                    {diary.content}
                  </div>

                  {/* 卡片装饰 */}
                  <div className="mt-4 pt-4 border-t border-[#c4a77d]/20 flex items-center justify-between text-xs text-[#5c4a32]/50">
                    <span>✨ 珍藏于此</span>
                    <button className="hover:text-[#8b7355] transition-colors">
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
