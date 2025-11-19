import { NextRequest, NextResponse } from 'next/server'
import { invalidateCache, invalidateCacheBatch } from '@/lib/screenshot-cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, urls } = body

    if (!url && !urls) {
      return NextResponse.json(
        { error: 'Either "url" or "urls" is required' },
        { status: 400 }
      )
    }

    if (url && urls) {
      return NextResponse.json(
        { error: 'Provide either "url" or "urls", not both' },
        { status: 400 }
      )
    }

    if (url) {
      if (typeof url !== 'string') {
        return NextResponse.json(
          { error: '"url" must be a string' },
          { status: 400 }
        )
      }

      try {
        const validUrl = new URL(url)
        if (!['http:', 'https:'].includes(validUrl.protocol)) {
          return NextResponse.json(
            { error: 'URL must use http or https protocol' },
            { status: 400 }
          )
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        )
      }

      await invalidateCache(url)
      return NextResponse.json({
        success: true,
        message: `Cache invalidated for ${url}`,
      })
    }

    if (urls) {
      if (!Array.isArray(urls)) {
        return NextResponse.json(
          { error: '"urls" must be an array' },
          { status: 400 }
        )
      }

      if (urls.length === 0) {
        return NextResponse.json(
          { error: '"urls" array cannot be empty' },
          { status: 400 }
        )
      }

      for (const u of urls) {
        if (typeof u !== 'string') {
          return NextResponse.json(
            { error: 'All items in "urls" must be strings' },
            { status: 400 }
          )
        }

        try {
          const validUrl = new URL(u)
          if (!['http:', 'https:'].includes(validUrl.protocol)) {
            return NextResponse.json(
              { error: `URL must use http or https protocol: ${u}` },
              { status: 400 }
            )
          }
        } catch (error) {
          return NextResponse.json(
            { error: `Invalid URL format: ${u}` },
            { status: 400 }
          )
        }
      }

      await invalidateCacheBatch(urls)
      return NextResponse.json({
        success: true,
        message: `Cache invalidated for ${urls.length} URL(s)`,
        count: urls.length,
      })
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error invalidating cache:', error)
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    )
  }
}

