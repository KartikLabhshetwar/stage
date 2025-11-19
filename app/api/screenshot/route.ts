import { NextRequest, NextResponse } from 'next/server'
import { getCachedScreenshot, cacheScreenshot, normalizeUrl, invalidateCache } from '@/lib/screenshot-cache'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

const SCREENSHOT_API_URL = process.env.SCREENSHOT_API_URL || 'https://api.screen-shot.xyz'

async function captureViaService(url: string, deviceType: 'desktop' | 'mobile' = 'desktop'): Promise<{ screenshot: string; strategy: string }> {
  try {
    const viewport = deviceType === 'mobile' 
      ? { width: '375', height: '667' }
      : { width: '1920', height: '1080' }
    
    const params = new URLSearchParams({
      url: url,
      width: viewport.width,
      height: viewport.height,
      format: 'png',
    })
    
    const apiUrl = `${SCREENSHOT_API_URL}/take?${params.toString()}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(55000),
    })

    const contentType = response.headers.get('content-type') || ''
    const arrayBuffer = await response.arrayBuffer()
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Empty response from screenshot API')
    }

    if (!response.ok) {
      let errorMessage = `Screenshot API returned ${response.status}`
      
      try {
        const text = new TextDecoder().decode(arrayBuffer)
        const errorData = JSON.parse(text)
        errorMessage = errorData.error || errorMessage
      } catch {
        // Ignore parsing errors, use default error message
      }
      
      if (response.status === 408 || response.status === 504) {
        throw new Error('timeout')
      }
      if (response.status >= 400 && response.status < 500) {
        throw new Error('connection_error')
      }
      throw new Error(errorMessage)
    }

    const buffer = Buffer.from(arrayBuffer)
    
    const firstBytes = buffer.subarray(0, 8)
    const isPng = firstBytes[0] === 0x89 && firstBytes[1] === 0x50 && firstBytes[2] === 0x4E && firstBytes[3] === 0x47
    const isJpeg = firstBytes[0] === 0xFF && firstBytes[1] === 0xD8
    
    if (!isPng && !isJpeg) {
      if (contentType.includes('application/json') || contentType.includes('text/')) {
        try {
          const text = new TextDecoder().decode(arrayBuffer)
          const errorData = JSON.parse(text)
          throw new Error(errorData.error || 'Invalid response from screenshot API')
        } catch {
          // Ignore parsing errors, throw generic error
          throw new Error('Invalid response from screenshot API')
        }
      }
      throw new Error('Invalid image format received from screenshot API: expected PNG or JPEG')
    }
    
    const base64Screenshot = buffer.toString('base64')
    
    return {
      screenshot: base64Screenshot,
      strategy: 'screen-shot-api',
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('timeout')
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('connection_error')
    }
    console.error('Screenshot service error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimit = checkRateLimit(ip)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString()
          }
        }
      )
    }

    const body = await request.json()
    const { url, forceRefresh, deviceType = 'desktop' } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    if (deviceType && !['desktop', 'mobile'].includes(deviceType)) {
      return NextResponse.json(
        { error: 'deviceType must be either "desktop" or "mobile"' },
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

    const normalizedUrl = normalizeUrl(validUrl.toString())
    const cacheKey = `${normalizedUrl}:${deviceType}`

    if (forceRefresh) {
      try {
        await invalidateCache(normalizedUrl)
      } catch (invalidateError) {
        console.warn('Failed to invalidate cache:', invalidateError)
      }
    }

    if (!forceRefresh) {
      try {
        const cachedScreenshot = await getCachedScreenshot(cacheKey)
        if (cachedScreenshot) {
          return NextResponse.json({
            screenshot: cachedScreenshot,
            url: normalizedUrl,
            cached: true,
            deviceType,
          })
        }
      } catch (cacheError) {
        console.warn('Cache check failed:', cacheError)
      }
    }

    const { screenshot, strategy } = await captureViaService(normalizedUrl, deviceType)

    try {
      await cacheScreenshot(cacheKey, screenshot)
    } catch (cacheError) {
      console.warn('Failed to cache screenshot:', cacheError)
    }

    return NextResponse.json({
      screenshot,
      url: normalizedUrl,
      cached: false,
      strategy,
      deviceType,
    })
  } catch (error) {
    console.error('Screenshot error:', error)

    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        return NextResponse.json(
          { error: 'Website took too long to load. Please try again or try a different URL.' },
          { status: 408 }
        )
      }

      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        return NextResponse.json(
          { error: 'Screenshot service is unavailable. Please try again later.' },
          { status: 503 }
        )
      }

      if (error.message.includes('net::ERR_NAME_NOT_RESOLVED') || 
          error.message.includes('net::ERR_CONNECTION_REFUSED') ||
          error.message.includes('net::ERR_CONNECTION_TIMED_OUT') ||
          error.message.includes('NS_ERROR_UNKNOWN_HOST')) {
        return NextResponse.json(
          { error: 'Could not connect to the website. Please check the URL and try again.' },
          { status: 400 }
        )
      }

      if (error.message.includes('SSL') || 
          error.message.includes('certificate') ||
          error.message.includes('ERR_CERT')) {
        return NextResponse.json(
          { error: 'Website has SSL certificate issues. The screenshot may be incomplete.' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to capture screenshot. Please try again or contact support if the issue persists.' },
      { status: 500 }
    )
  }
}
