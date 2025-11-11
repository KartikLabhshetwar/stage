'use client'

import { useRef } from 'react'
import { Group, Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'
import { useImageStore } from '@/lib/store'
import { getMockupDefinition } from '@/lib/constants/mockups'
import type { Mockup } from '@/types/mockup'

interface ImacMockupRendererProps {
  mockup: Mockup
  canvasWidth: number
  canvasHeight: number
}

export function ImacMockupRenderer({ mockup }: ImacMockupRendererProps) {
  const { uploadedImageUrl, updateMockup } = useImageStore()
  const definition = getMockupDefinition(mockup.definitionId)
  const [mockupImg, mockupStatus] = useImage(definition?.src || '')
  const [userImg] = useImage(uploadedImageUrl || '')
  const groupRef = useRef<any>(null)

  if (!definition || !mockup.isVisible) return null
  if (mockupStatus === 'loading') return null
  if (!mockupImg) return null

  const mockupAspectRatio = mockupImg.width / mockupImg.height
  const mockupWidth = mockup.size
  const mockupHeight = mockupWidth / mockupAspectRatio

  const screenAreaX = definition.screenArea.x * mockupWidth
  const screenAreaY = definition.screenArea.y * mockupHeight
  const screenAreaWidth = definition.screenArea.width * mockupWidth
  const screenAreaHeight = definition.screenArea.height * mockupHeight

  const contentStartY = screenAreaY
  const contentHeight = screenAreaHeight
  const contentWidth = screenAreaWidth

  const userImageAspectRatio = userImg ? userImg.width / userImg.height : 1
  const contentAspectRatio = contentWidth / contentHeight

  let userImageWidth = contentWidth
  let userImageHeight = contentHeight
  let userImageX = screenAreaX
  let userImageY = screenAreaY

  if (mockup.imageFit === 'cover') {
    if (userImageAspectRatio > contentAspectRatio) {
      userImageHeight = contentHeight
      userImageWidth = userImageHeight * userImageAspectRatio
      userImageX = screenAreaX - (userImageWidth - contentWidth) / 2
    } else {
      userImageWidth = contentWidth
      userImageHeight = userImageWidth / userImageAspectRatio
      userImageY = screenAreaY - (userImageHeight - contentHeight) / 2
    }
  } else {
    if (userImageAspectRatio > contentAspectRatio) {
      userImageWidth = contentWidth
      userImageHeight = userImageWidth / userImageAspectRatio
      userImageX = screenAreaX
      userImageY = screenAreaY + (contentHeight - userImageHeight) / 2
    } else {
      userImageHeight = contentHeight
      userImageWidth = userImageHeight * userImageAspectRatio
      userImageX = screenAreaX + (contentWidth - userImageWidth) / 2
      userImageY = screenAreaY
    }
  }

  return (
    <Group
      ref={groupRef}
      x={mockup.position.x}
      y={mockup.position.y}
      rotation={mockup.rotation}
      opacity={mockup.opacity}
      draggable
      onDragEnd={(e) => {
        const { x, y } = e.target.position()
        updateMockup(mockup.id, { position: { x, y } })
      }}
    >
      <KonvaImage image={mockupImg} width={mockupWidth} height={mockupHeight} />
      {userImg && (
        <Group
          clipFunc={(ctx) => {
            const borderRadius = definition.screenArea.borderRadius || 0
            const x = screenAreaX
            const y = screenAreaY
            const w = contentWidth
            const h = contentHeight
            const r = borderRadius
            ctx.beginPath()
            if (borderRadius > 0) {
              ctx.moveTo(x + r, y)
              ctx.lineTo(x + w - r, y)
              ctx.quadraticCurveTo(x + w, y, x + w, y + r)
              ctx.lineTo(x + w, y + h - r)
              ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
              ctx.lineTo(x + r, y + h)
              ctx.quadraticCurveTo(x, y + h, x, y + h - r)
              ctx.lineTo(x, y + r)
              ctx.quadraticCurveTo(x, y, x + r, y)
              ctx.closePath()
            } else {
              ctx.rect(x, y, w, h)
            }
            ctx.clip()
          }}
        >
          <KonvaImage
            image={userImg}
            x={userImageX}
            y={userImageY}
            width={userImageWidth}
            height={userImageHeight}
          />
        </Group>
      )}
    </Group>
  )
}

