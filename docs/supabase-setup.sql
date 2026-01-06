-- ============================================
-- AI 语音日记本 - Supabase 数据库设置脚本
-- ============================================
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本
-- ============================================

-- 1. 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建 profiles 表（用户资料）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. 创建 diaries 表（日记）
CREATE TABLE IF NOT EXISTS public.diaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weather TEXT NOT NULL DEFAULT '晴天',
  mood_tags TEXT[] NOT NULL DEFAULT '{平静}',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. 创建 updated_at 自动触发器
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 profiles 表添加 updated_at 触发器
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 为 diaries 表添加 updated_at 触发器
DROP TRIGGER IF EXISTS set_diaries_updated_at ON public.diaries;
CREATE TRIGGER set_diaries_updated_at
  BEFORE UPDATE ON public.diaries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS diaries_user_id_idx ON public.diaries(user_id);
CREATE INDEX IF NOT EXISTS diaries_date_idx ON public.diaries(date DESC);
CREATE INDEX IF NOT EXISTS diaries_created_at_idx ON public.diaries(created_at DESC);

-- ============================================
-- Row Level Security (RLS) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaries ENABLE ROW LEVEL SECURITY;

-- Profiles 表策略
-- 用户可以查看自己的资料
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 用户可以更新自己的资料
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 新用户注册时自动创建 profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Diaries 表策略
-- 用户可以查看自己的所有日记
CREATE POLICY "Users can view own diaries"
  ON public.diaries FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以创建日记
CREATE POLICY "Users can insert own diaries"
  ON public.diaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的日记
CREATE POLICY "Users can update own diaries"
  ON public.diaries FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户可以删除自己的日记
CREATE POLICY "Users can delete own diaries"
  ON public.diaries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 自动创建 Profile 的触发器
-- ============================================

-- 当新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 在 auth.users 表上创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 示例查询（用于测试）
-- ============================================

-- 查看当前用户的所有日记（需要在 Supabase CLI 或客户端中执行）
-- SELECT * FROM public.diaries WHERE user_id = auth.uid();

-- 查看所有表
-- SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public';

-- 查看 RLS 策略
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('profiles', 'diaries');

-- ============================================
-- 完成！
-- ============================================
