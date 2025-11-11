import { createHash } from 'crypto'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from './db'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export function normalizeUrl(urlString: string): string {
  try {
    const url = new URL(urlString)
    
    url.protocol = url.protocol.toLowerCase()
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    
    if (url.port === '80' && url.protocol === 'http:') {
      url.port = ''
    }
    if (url.port === '443' && url.protocol === 'https:') {
      url.port = ''
    }
    
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1)
    }
    
    url.hash = ''
    
    if (url.search) {
      const params = new URLSearchParams(url.search)
      const sortedParams = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
      url.search = sortedParams.length > 0 
        ? '?' + new URLSearchParams(sortedParams).toString()
        : ''
    }
    
    return url.toString()
  } catch (error) {
    return urlString
  }
}

export function hashUrl(url: string): string {
  const normalized = normalizeUrl(url)
  return createHash('sha256').update(normalized).digest('hex')
}

async function uploadToCloudinary(
  screenshotBase64: string,
  publicId: string
): Promise<{ publicId: string; secureUrl: string }> {
  try {
    const buffer = Buffer.from(screenshotBase64, 'base64')
    
    const result = await new Promise<{
      public_id: string
      secure_url: string
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: `screenshots/${publicId}`,
          folder: 'screenshots',
          overwrite: true,
          resource_type: 'image',
          format: 'png',
          transformation: [
            {
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (error: Error | undefined, result: any) => {
          if (error) reject(error)
          else resolve(result!)
        }
      )
      
      uploadStream.end(buffer)
    })
    
    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
    }
  } catch (error) {
    console.error('Error uploading screenshot to Cloudinary:', error)
    throw error
  }
}

export async function getCachedScreenshot(
  url: string,
  maxAgeMs: number = 2 * 24 * 60 * 60 * 1000
): Promise<string | null> {
  try {
    const hash = hashUrl(url)
    
    const cached = await prisma.screenshotCache.findUnique({
      where: { urlHash: hash },
      select: { 
        cloudinaryUrl: true,
        createdAt: true,
      },
    })
    
    if (!cached) {
      return null
    }
    
    const age = Date.now() - cached.createdAt.getTime()
    if (age > maxAgeMs) {
      console.log(`Cache expired for ${url}, invalidating...`)
      await invalidateCache(url)
      return null
    }
    
    try {
      const response = await fetch(cached.cloudinaryUrl)
      if (!response.ok) {
        await prisma.screenshotCache.delete({
          where: { urlHash: hash },
        })
        return null
      }
      
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      return buffer.toString('base64')
    } catch (fetchError) {
      console.error('Error fetching screenshot from Cloudinary:', fetchError)
      await prisma.screenshotCache.delete({
        where: { urlHash: hash },
      }).catch(() => {
      })
      return null
    }
  } catch (error) {
    console.error('Error reading cached screenshot from database:', error)
    return null
  }
}

export async function cacheScreenshot(url: string, screenshotBase64: string): Promise<void> {
  try {
    const hash = hashUrl(url)
    const normalizedUrl = normalizeUrl(url)
    
    const existing = await prisma.screenshotCache.findUnique({
      where: { urlHash: hash },
    })
    
    if (existing) {
      const cloudinaryResult = await uploadToCloudinary(screenshotBase64, hash)
      
      await prisma.screenshotCache.update({
        where: { urlHash: hash },
        data: {
          url: normalizedUrl,
          cloudinaryPublicId: cloudinaryResult.publicId,
          cloudinaryUrl: cloudinaryResult.secureUrl,
          updatedAt: new Date(),
        },
      })
    } else {
      const cloudinaryResult = await uploadToCloudinary(screenshotBase64, hash)
      
      await prisma.screenshotCache.create({
        data: {
          urlHash: hash,
          url: normalizedUrl,
          cloudinaryPublicId: cloudinaryResult.publicId,
          cloudinaryUrl: cloudinaryResult.secureUrl,
        },
      })
    }
  } catch (error) {
    console.error('Error caching screenshot:', error)
  }
}

export async function invalidateCache(url: string): Promise<void> {
  try {
    const hash = hashUrl(url)
    
    const entry = await prisma.screenshotCache.findUnique({
      where: { urlHash: hash },
      select: { cloudinaryPublicId: true },
    })
    
    if (!entry) {
      return 
    }
    
    try {
      await cloudinary.api.delete_resources([entry.cloudinaryPublicId], {
        resource_type: 'image',
      })
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError)
    }
    
    await prisma.screenshotCache.delete({
      where: { urlHash: hash },
    })
    
    console.log(`Cache invalidated for ${url}`)
  } catch (error) {
    console.error('Error invalidating cache:', error)
  }
}

export async function invalidateCacheBatch(urls: string[]): Promise<void> {
  const hashes = urls.map(url => hashUrl(url))
  
  try {
    const entries = await prisma.screenshotCache.findMany({
      where: {
        urlHash: { in: hashes },
      },
      select: { cloudinaryPublicId: true },
    })
    
    if (entries.length === 0) {
      return
    }
    
    const publicIds = entries.map((e: { cloudinaryPublicId: string }) => e.cloudinaryPublicId)
    if (publicIds.length > 0) {
      try {
        await cloudinary.api.delete_resources(publicIds, {
          resource_type: 'image',
        })
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError)
      }
    }
    
    await prisma.screenshotCache.deleteMany({
      where: {
        urlHash: { in: hashes },
      },
    })
    
    console.log(`Invalidated ${entries.length} cache entries`)
  } catch (error) {
    console.error('Error invalidating cache batch:', error)
  }
}

export async function clearOldCache(maxAgeMs: number = 2 * 24 * 60 * 60 * 1000): Promise<void> {
  try {
    const cutoffDate = new Date(Date.now() - maxAgeMs)
    
    const oldEntries = await prisma.screenshotCache.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
        cloudinaryPublicId: true,
      },
    })
    
    if (oldEntries.length === 0) {
      return
    }
    
    const publicIds = oldEntries.map((entry: { cloudinaryPublicId: string }) => entry.cloudinaryPublicId)
    if (publicIds.length > 0) {
      try {
        await cloudinary.api.delete_resources(publicIds, {
          resource_type: 'image',
        })
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError)
      }
    }
    
    const result = await prisma.screenshotCache.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })
    
    if (result.count > 0) {
      console.log(`Cleared ${result.count} old cache entries`)
    }
  } catch (error) {
    console.error('Error clearing old cache:', error)
  }
}
