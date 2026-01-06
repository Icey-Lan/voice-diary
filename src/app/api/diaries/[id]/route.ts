import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

// PUT /api/diaries/[id] - 更新日记
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id: diaryId } = await context.params
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    )

    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 解析请求体
    const body = await request.json()
    const { date, weather, moodTags, content } = body

    // 更新日记（RLS 会确保用户只能更新自己的日记）
    const { data: diary, error } = await supabase
      .from('diaries')
      .update({
        date,
        weather,
        mood_tags: moodTags,
        content,
      })
      .eq('id', diaryId)
      .eq('user_id', user.id) // 双重验证
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }

    if (!diary) {
      return NextResponse.json(
        { error: 'Diary not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ diary })
  } catch (error) {
    console.error('Error updating diary:', error)
    return NextResponse.json(
      { error: 'Failed to update diary', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE /api/diaries/[id] - 删除日记
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id: diaryId } = await context.params
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    )

    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 删除日记（RLS 会确保用户只能删除自己的日记）
    const { error } = await supabase
      .from('diaries')
      .delete()
      .eq('id', diaryId)
      .eq('user_id', user.id) // 双重验证

    if (error) {
      console.error('Supabase delete error:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting diary:', error)
    return NextResponse.json(
      { error: 'Failed to delete diary', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
