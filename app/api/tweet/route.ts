import { NextRequest, NextResponse } from 'next/server'

function extractTweetId(url: string): string | null {
  const patterns = [
    /twitter\.com\/\w+\/status\/(\d+)/,
    /x\.com\/\w+\/status\/(\d+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

function parseTweetHtml(html: string): {
  content: string
  authorName: string
  authorHandle: string
  timestamp: string
} {
  let content = ''
  const pMatch = html.match(/<p[^>]*lang="[^"]*"[^>]*dir="[^"]*"[^>]*>([\s\S]*?)<\/p>/)
  if (pMatch && pMatch[1]) {
    content = pMatch[1]
      .replace(/<a[^>]*>([^<]*)<\/a>/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim()
  }
  
  const authorMatch = html.match(/&mdash;\s*([^<]+?)\s*\(@(\w+)\)/)
  const authorName = authorMatch?.[1]?.trim() || 'Unknown'
  const authorHandle = authorMatch?.[2] || 'unknown'
  
  const timestampMatches = html.matchAll(/<a[^>]*href="[^"]*\/status\/\d+[^"]*"[^>]*>([^<]+)<\/a>/g)
  const timestampArray = Array.from(timestampMatches)
  const timestamp = timestampArray.length > 0 ? timestampArray[timestampArray.length - 1]?.[1] || '' : ''
  
  return {
    content: content || 'Tweet content',
    authorName,
    authorHandle,
    timestamp: timestamp || 'Just now',
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Tweet URL is required' },
        { status: 400 }
      )
    }

    let validUrl: URL
    try {
      validUrl = new URL(url)
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

    const tweetId = extractTweetId(validUrl.toString())
    if (!tweetId) {
      return NextResponse.json(
        { error: 'Invalid tweet URL. Must be a Twitter/X status URL' },
        { status: 400 }
      )
    }

    const oembedUrl = new URL('https://publish.twitter.com/oembed')
    oembedUrl.searchParams.set('url', validUrl.toString())
    oembedUrl.searchParams.set('omit_script', 'true')
    oembedUrl.searchParams.set('hide_media', 'false')
    oembedUrl.searchParams.set('hide_thread', 'true')

    const response = await fetch(oembedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TweetCard/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Tweet not found or is private' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: `Failed to fetch tweet: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    const parsed = parseTweetHtml(data.html)
    
    const tweetData = {
      url: validUrl.toString(),
      authorName: parsed.authorName,
      authorHandle: parsed.authorHandle,
      authorAvatar: undefined,
      content: parsed.content,
      timestamp: parsed.timestamp,
      likes: 0,
      retweets: 0,
      replies: 0,
      quotes: 0,
    }

    return NextResponse.json({
      tweetData,
    })
  } catch (error) {
    console.error('Tweet fetch error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 408 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to fetch tweet data' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

