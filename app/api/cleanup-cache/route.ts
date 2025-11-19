import { NextRequest, NextResponse } from 'next/server'
import { clearOldCache } from '@/lib/screenshot-cache'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret } = body

    if (secret !== process.env.CLEANUP_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await clearOldCache()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache cleanup completed' 
    })
  } catch (error) {
    console.error('Cache cleanup error:', error)
    return NextResponse.json(
      { error: 'Cache cleanup failed' },
      { status: 500 }
    )
  }
}

