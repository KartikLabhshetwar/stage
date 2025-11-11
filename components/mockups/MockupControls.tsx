'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { useImageStore } from '@/lib/store'
import { Trash2, Eye, EyeOff, Loader2, Link } from 'lucide-react'
import { getMockupDefinition } from '@/lib/constants/mockups'
import Image from 'next/image'

export function MockupControls() {
  const {
    mockups,
    updateMockup,
    removeMockup,
    clearMockups,
  } = useImageStore()

  const [selectedMockupId, setSelectedMockupId] = useState<string | null>(null)
  const [tweetUrl, setTweetUrl] = useState('')
  const [isLoadingTweet, setIsLoadingTweet] = useState(false)

  const selectedMockup = mockups.find(
    (mockup) => mockup.id === selectedMockupId
  )

  const selectedDefinition = selectedMockup
    ? getMockupDefinition(selectedMockup.definitionId)
    : null

  const handleUpdateSize = (value: number[]) => {
    if (selectedMockup) {
      updateMockup(selectedMockup.id, { size: value[0] })
    }
  }

  const handleUpdateRotation = (value: number[]) => {
    if (selectedMockup) {
      updateMockup(selectedMockup.id, { rotation: value[0] })
    }
  }

  const handleUpdateOpacity = (value: number[]) => {
    if (selectedMockup) {
      updateMockup(selectedMockup.id, { opacity: value[0] })
    }
  }

  const handleToggleVisibility = (id: string) => {
    const mockup = mockups.find((m) => m.id === id)
    if (mockup) {
      updateMockup(id, { isVisible: !mockup.isVisible })
    }
  }

  const handleUpdatePosition = (axis: 'x' | 'y', value: number[]) => {
    if (selectedMockup) {
      updateMockup(selectedMockup.id, {
        position: {
          ...selectedMockup.position,
          [axis]: value[0],
        },
      })
    }
  }

  const handleFetchTweet = async () => {
    if (!selectedMockup || !tweetUrl.trim()) return

    setIsLoadingTweet(true)
    try {
      const response = await fetch('/api/tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: tweetUrl.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch tweet')
      }

      const data = await response.json()
      updateMockup(selectedMockup.id, {
        tweetData: data.tweetData,
      })
      setTweetUrl('')
    } catch (error) {
      console.error('Error fetching tweet:', error)
      alert(error instanceof Error ? error.message : 'Failed to fetch tweet')
    } finally {
      setIsLoadingTweet(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Mockups</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearMockups}
          disabled={mockups.length === 0}
          className="h-8 px-3 text-xs font-medium rounded-lg"
        >
          Clear All
        </Button>
      </div>

      {mockups.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">Manage Mockups</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {mockups.map((mockup) => {
              const definition = getMockupDefinition(mockup.definitionId)
              return (
                <div
                  key={mockup.id}
                  className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                    selectedMockupId === mockup.id
                      ? 'bg-accent border-primary'
                      : 'bg-background hover:bg-accent border-border'
                  }`}
                  onClick={() => setSelectedMockupId(mockup.id)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleVisibility(mockup.id)
                    }}
                    className="h-6 w-6 p-0"
                  >
                    {mockup.isVisible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>
                  <div className="relative w-8 h-8 shrink-0 rounded overflow-hidden">
                    {definition && (
                      <Image
                        src={definition.src}
                        alt={definition.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    )}
                  </div>
                  <span className="flex-1 text-xs truncate">
                    {definition?.name || 'Mockup'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeMockup(mockup.id)
                      if (selectedMockupId === mockup.id) {
                        setSelectedMockupId(null)
                      }
                    }}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selectedMockup && selectedDefinition && (
        <div className="space-y-5 border-t pt-5">
          <div className="space-y-5">
            <p className="text-sm font-semibold text-foreground">
              Edit Mockup
            </p>

            {selectedDefinition.type === 'tweet' && (
              <div className="space-y-3 p-3 rounded-xl bg-muted border border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Tweet URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://twitter.com/username/status/123456"
                      value={tweetUrl}
                      onChange={(e) => setTweetUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isLoadingTweet) {
                          handleFetchTweet()
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleFetchTweet}
                      disabled={!tweetUrl.trim() || isLoadingTweet}
                      size="sm"
                      className="shrink-0"
                    >
                      {isLoadingTweet ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste a Twitter/X tweet URL to load the tweet data
                  </p>
                </div>
                {selectedMockup.tweetData && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs font-medium text-foreground mb-1">
                      Current Tweet
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{selectedMockup.tweetData.authorHandle}: {selectedMockup.tweetData.content.substring(0, 50)}
                      {selectedMockup.tweetData.content.length > 50 ? '...' : ''}
                    </p>
                  </div>
                )}
                {!selectedMockup.tweetData && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Using placeholder data. Add a tweet URL to load real tweet content.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Size</span>
              <div className="flex-1 flex items-center gap-3">
                <Slider
                  value={[selectedMockup.size]}
                  onValueChange={handleUpdateSize}
                  max={1200}
                  min={200}
                  step={10}
                />
                <span className="text-sm text-foreground font-medium whitespace-nowrap">{selectedMockup.size}px</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Rotation</span>
              <div className="flex-1 flex items-center gap-3">
                <Slider
                  value={[selectedMockup.rotation]}
                  onValueChange={handleUpdateRotation}
                  max={360}
                  min={0}
                  step={1}
                />
                <span className="text-sm text-foreground font-medium whitespace-nowrap">{selectedMockup.rotation}°</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Opacity</span>
              <div className="flex-1 flex items-center gap-3">
                <Slider
                  value={[selectedMockup.opacity]}
                  onValueChange={handleUpdateOpacity}
                  max={1}
                  min={0}
                  step={0.01}
                />
                <span className="text-sm text-foreground font-medium whitespace-nowrap">{Math.round(selectedMockup.opacity * 100)}%</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">Position</p>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <span className="text-sm font-medium text-foreground whitespace-nowrap">X Position</span>
                <div className="flex-1 flex items-center gap-3">
                  <Slider
                    value={[selectedMockup.position.x]}
                    onValueChange={(value) => handleUpdatePosition('x', value)}
                    max={1600}
                    min={0}
                    step={1}
                  />
                  <span className="text-sm text-foreground font-medium whitespace-nowrap">{Math.round(selectedMockup.position.x)}px</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <span className="text-sm font-medium text-foreground whitespace-nowrap">Y Position</span>
                <div className="flex-1 flex items-center gap-3">
                  <Slider
                    value={[selectedMockup.position.y]}
                    onValueChange={(value) => handleUpdatePosition('y', value)}
                    max={1000}
                    min={0}
                    step={1}
                  />
                  <span className="text-sm text-foreground font-medium whitespace-nowrap">{Math.round(selectedMockup.position.y)}px</span>
                </div>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                removeMockup(selectedMockup.id)
                setSelectedMockupId(null)
              }}
              className="w-full h-10 rounded-xl"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Mockup
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

