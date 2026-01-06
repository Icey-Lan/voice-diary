import { Icon } from "./icons/Icon"
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
            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-sm shadow-md"
            : "bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-200"
        }`}
      >
        <div className="flex items-start gap-2">
          {!isUser && (
            <div className="icon-soft-primary shrink-0">
              <Icon name="sparkles" size={14} className="text-white" />
            </div>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        <div className={`text-xs mt-1 ${isUser ? "text-white/70" : "text-slate-400"}`}>
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  )
}
