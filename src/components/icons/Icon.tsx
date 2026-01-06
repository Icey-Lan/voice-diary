import { LucideProps } from 'lucide-react'
import {
  BookOpen,
  Sun,
  CloudRain,
  Heart,
  Moon,
  Sparkles,
  Zap,
  Smile,
  Lightbulb,
  MessageSquare,
  Edit3,
  Sprout,
  Image as GalleryIcon,
  Calendar,
  FileText,
  Cloud,
  CloudDrizzle,
  CloudFog,
  Snowflake,
  ChevronLeft,
  Settings,
  Mic,
  StopCircle,
  Send,
  Trash2,
} from 'lucide-react'

export interface IconProps extends LucideProps {
  name: keyof typeof iconMap
}

const iconMap = {
  diary: BookOpen,
  leaf: Sprout,
  sun: Sun,
  'cloud-rain': CloudRain,
  heart: Heart,
  moon: Moon,
  sparkles: Sparkles,
  zap: Zap,
  smile: Smile,
  lightbulb: Lightbulb,
  'chat-bubble': MessageSquare,
  edit: Edit3,
  sprout: Sprout,
  gallery: GalleryIcon,
  calendar: Calendar,
  document: FileText,
  cloud: Cloud,
  'cloud-sun': Sun,
  'cloud-drizzle': CloudDrizzle,
  'cloud-fog': CloudFog,
  snowflake: Snowflake,
  'chevron-left': ChevronLeft,
  settings: Settings,
  mic: Mic,
  'stop-circle': StopCircle,
  send: Send,
  trash: Trash2,
}

export { BookOpen, Heart, Sprout, Sun, Moon, Sparkles }
export { iconMap }

export function Icon({ name, ...props }: IconProps) {
  const IconComponent = iconMap[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return <IconComponent {...props} />
}
