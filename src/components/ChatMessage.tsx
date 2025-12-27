import { ChatMessage as ChatMessageType } from "@/types"

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} fade-in`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[#9caf88] text-white rounded-br-sm"
            : "bg-white text-[#2c2416] rounded-bl-sm shadow-md"
        }`}
      >
        <div className="flex items-start gap-2">
          {!isUser && <span className="text-lg">🌻</span>}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        <div className={`text-xs mt-1 ${isUser ? "text-white/70" : "text-[#5c4a32]/50"}`}>
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  )
}
