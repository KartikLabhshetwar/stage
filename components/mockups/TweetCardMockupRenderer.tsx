'use client'

import { useRef } from 'react'
import { Group, Rect, Text, Circle, Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'
import { useImageStore } from '@/lib/store'
import { getMockupDefinition } from '@/lib/constants/mockups'
import type { Mockup } from '@/types/mockup'

interface TweetCardMockupRendererProps {
  mockup: Mockup
  canvasWidth: number
  canvasHeight: number
}

export function TweetCardMockupRenderer({ mockup }: TweetCardMockupRendererProps) {
  const { updateMockup } = useImageStore()
  const definition = getMockupDefinition(mockup.definitionId)
  const groupRef = useRef<any>(null)

  if (!definition || !mockup.isVisible) return null

  const defaultTweetData = {
    url: '',
    authorName: 'Twitter User',
    authorHandle: 'username',
    authorAvatar: undefined,
    content: 'Add a tweet URL in the controls panel to load a real tweet, or customize this placeholder card!',
    timestamp: 'Just now',
    likes: 0,
    retweets: 0,
    replies: 0,
    quotes: 0,
  }

  const tweetData = mockup.tweetData || defaultTweetData
  const cardWidth = mockup.size
  const cardHeight = cardWidth * 0.6
  const padding = cardWidth * 0.05
  const borderRadius = 16

  const avatarSize = cardWidth * 0.12
  const avatarX = padding
  const avatarY = padding
  const headerY = padding
  const headerX = padding + avatarSize + padding * 0.8
  const nameY = headerY
  const handleY = nameY + cardWidth * 0.04
  const contentY = headerY + avatarSize * 0.6
  const contentX = padding
  const contentWidth = cardWidth - padding * 2
  const timestampY = contentY + cardWidth * 0.15
  const metricsY = timestampY + cardWidth * 0.05
  const closeButtonSize = cardWidth * 0.04
  const closeButtonX = cardWidth - padding - closeButtonSize
  const closeButtonY = padding

  const [avatarImg, avatarStatus] = useImage(tweetData.authorAvatar || '')

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = {
        width: testLine.length * fontSize * 0.6,
      }
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return lines
  }

  const contentLines = wrapText(tweetData.content, contentWidth, cardWidth * 0.035)

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
      <Rect
        x={0}
        y={0}
        width={cardWidth}
        height={cardHeight}
        fill="#E8F5FE"
        cornerRadius={borderRadius}
        shadowBlur={10}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ x: 0, y: 2 }}
      />

      <Rect
        x={padding}
        y={padding}
        width={cardWidth - padding * 2}
        height={cardHeight - padding * 2}
        fill="#FFFFFF"
        cornerRadius={borderRadius * 0.8}
      />

      {avatarImg && avatarStatus === 'loaded' ? (
        <Circle
          x={avatarX + avatarSize / 2}
          y={avatarY + avatarSize / 2}
          radius={avatarSize / 2}
          fillPatternImage={avatarImg}
          fillPatternScaleX={avatarSize / avatarImg.width}
          fillPatternScaleY={avatarSize / avatarImg.height}
        />
      ) : (
        <Circle
          x={avatarX + avatarSize / 2}
          y={avatarY + avatarSize / 2}
          radius={avatarSize / 2}
          fill="#1DA1F2"
        />
      )}

      <Text
        x={headerX}
        y={nameY}
        text={tweetData.authorName}
        fontSize={cardWidth * 0.04}
        fontFamily="Arial, sans-serif"
        fontStyle="bold"
        fill="#000000"
      />

      <Text
        x={headerX}
        y={handleY}
        text={`@${tweetData.authorHandle}`}
        fontSize={cardWidth * 0.032}
        fontFamily="Arial, sans-serif"
        fill="#536471"
      />

      {contentLines.map((line, index) => (
        <Text
          key={index}
          x={contentX}
          y={contentY + index * cardWidth * 0.045}
          text={line}
          fontSize={cardWidth * 0.035}
          fontFamily="Arial, sans-serif"
          fill="#000000"
          width={contentWidth}
        />
      ))}

      <Text
        x={contentX}
        y={timestampY}
        text={tweetData.timestamp}
        fontSize={cardWidth * 0.028}
        fontFamily="Arial, sans-serif"
        fill="#536471"
      />

      <Group x={contentX} y={metricsY}>
        <Text
          x={0}
          y={0}
          text={`${formatNumber(tweetData.retweets)} retweets`}
          fontSize={cardWidth * 0.028}
          fontFamily="Arial, sans-serif"
          fill="#536471"
        />
        <Text
          x={cardWidth * 0.25}
          y={0}
          text={`${formatNumber(tweetData.quotes || 0)} quotes`}
          fontSize={cardWidth * 0.028}
          fontFamily="Arial, sans-serif"
          fill="#536471"
        />
        <Text
          x={cardWidth * 0.5}
          y={0}
          text={`${formatNumber(tweetData.likes)} likes`}
          fontSize={cardWidth * 0.028}
          fontFamily="Arial, sans-serif"
          fill="#536471"
        />
        <Text
          x={cardWidth * 0.75}
          y={0}
          text={`${formatNumber(tweetData.replies)} replies`}
          fontSize={cardWidth * 0.028}
          fontFamily="Arial, sans-serif"
          fill="#536471"
        />
      </Group>

      <Rect
        x={closeButtonX}
        y={closeButtonY}
        width={closeButtonSize}
        height={closeButtonSize}
        fill="#000000"
        cornerRadius={closeButtonSize / 4}
        onClick={() => {}}
      />
      <Text
        x={closeButtonX + closeButtonSize / 2}
        y={closeButtonY + closeButtonSize / 2}
        text="×"
        fontSize={closeButtonSize * 0.7}
        fontFamily="Arial, sans-serif"
        fill="#FFFFFF"
        align="center"
        verticalAlign="middle"
        offsetX={closeButtonSize * 0.35}
        offsetY={closeButtonSize * 0.25}
      />
    </Group>
  )
}

