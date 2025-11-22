'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import TopRightMenu from '@/components/TopRightMenu'
import HelpOverlay from '@/components/HelpOverlay'
import UtilityBar from '@/components/UtilityBar'
import Canvas, { CanvasRef } from '@/components/Canvas'
import styles from './page.module.css'

const CROP_BOX_WIDTH = 800
const CROP_BOX_HEIGHT = 600
const DEFAULT_CROP_BOX_WIDTH = 832
const DEFAULT_CROP_BOX_HEIGHT = 1216

export default function Home() {
  const canvasRef = useRef<CanvasRef>(null)
  const [positionInitialized, setPositionInitialized] = useState(false)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [cropWidth, setCropWidth] = useState(832)
  const [cropHeight, setCropHeight] = useState(1216)
  const [zoomSensitivity, setZoomSensitivity] = useState(10)
  const [showHelp, setShowHelp] = useState(false)
  const [originalWidth, setOriginalWidth] = useState(0)
  const [originalHeight, setOriginalHeight] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageData, setImageData] = useState<string | null>(null)
  const [videoData, setVideoData] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  
  // Video playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [browserCompatError, setBrowserCompatError] = useState<string | null>(null)

  // Check browser compatibility on mount
  useEffect(() => {
    const checkCompatibility = () => {
      const errors: string[] = []
      
      // Check for video element support
      const video = document.createElement('video')
      if (!video.canPlayType) {
        errors.push('Video playback is not supported in this browser')
      } else {
        // Check for MP4 support - canPlayType returns '', 'maybe', or 'probably'
        const mp4Support = video.canPlayType('video/mp4')
        if (!mp4Support) {
          errors.push('MP4 video format is not supported')
        }
      }
      
      // Check for canvas support
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        errors.push('Canvas 2D rendering is not supported')
      }
      
      // Check for Blob/File API
      if (!window.Blob || !window.File) {
        errors.push('File handling APIs are not supported')
      }
      
      if (errors.length > 0) {
        setBrowserCompatError(
          `Some features may not work in this browser:\\n${errors.join('\\n')}\\n\\nPlease use a modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)`
        )
      }
    }
    
    checkCompatibility()
  }, [])

  // Process image/video blob from any source
  const processMediaBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const type = blob.type.startsWith('video/') ? 'video' : 'image'
    
    console.log(`Created object URL from ${type} blob:`, url)
    
    // Reset position initialization flag for new media
    setPositionInitialized(false)
    
    if (type === 'video') {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        console.log(`Video loaded: ${video.videoWidth} x ${video.videoHeight}, duration: ${video.duration}s`)
        setVideoData(url)
        setImageData(null)
        setMediaType('video')
        setIsPlaying(false)
        setCurrentTime(0)
        console.log('✅ Video loaded successfully!')
      }
      video.onerror = () => {
        console.error('Failed to load video blob')
        URL.revokeObjectURL(url)
        alert('Failed to load video. Please ensure it is a supported format (MP4/WebM).')
      }
      video.src = url
    } else {
      const img = new Image()
      img.onload = () => {
        console.log(`Image loaded: ${img.naturalWidth} x ${img.naturalHeight}`)
        setImageData(url)
        setVideoData(null)
        setMediaType('image')
        console.log('✅ Image loaded successfully!')
      }
      img.onerror = () => {
        console.error('Failed to load image blob')
        URL.revokeObjectURL(url)
        alert('Failed to load image. Please try again.')
      }
      img.src = url
    }
  }

  // Handle video load from canvas
  const handleVideoLoad = (width: number, height: number, videoDuration: number) => {
    setOriginalWidth(width)
    setOriginalHeight(height)
    setImageLoaded(true)
    setRotation(0)
    setDuration(videoDuration)
    
    // Only center video on initial load, not on subsequent calls
    if (positionInitialized) {
      return
    }
    
    // Calculate initial scale and position to center video
    const canvasElement = document.querySelector('canvas')
    if (canvasElement) {
      const canvasWidth = canvasElement.width
      const canvasHeight = canvasElement.height
      
      const initialScale = 1.0
      const scaledWidth = width * initialScale
      const scaledHeight = height * initialScale
      const x = (canvasWidth - scaledWidth) / 2
      const y = (canvasHeight - scaledHeight) / 2
      
      setScale(initialScale)
      setImagePosition({ x, y })
      setPositionInitialized(true)
    }
  }

  // Handle image load from canvas
  const handleImageLoad = (width: number, height: number) => {
    setOriginalWidth(width)
    setOriginalHeight(height)
    setImageLoaded(true)
    setRotation(0) // Reset rotation on new image
    
    // Only center image on initial load, not on subsequent calls
    if (positionInitialized) {
      return
    }
    
    // Calculate initial scale and position to center image
    const canvasElement = document.querySelector('canvas')
    if (canvasElement) {
      const canvasWidth = canvasElement.width
      const canvasHeight = canvasElement.height
      
      // Start at 100% zoom (1.0 scale)
      const initialScale = 1.0
      
      // Center the image
      const scaledWidth = width * initialScale
      const scaledHeight = height * initialScale
      const x = (canvasWidth - scaledWidth) / 2
      const y = (canvasHeight - scaledHeight) / 2
      
      setScale(initialScale)
      setImagePosition({ x, y })
      setPositionInitialized(true)
    }
  }

  const handleCropResize = (width: number, height: number) => {
    setCropWidth(width)
    setCropHeight(height)
  }

  const copyImageToClipboard = useCallback(async () => {
    try {
      const canvas = canvasRef.current?.getCroppedCanvas()
      if (!canvas) {
        console.error('Failed to get cropped canvas')
        return
      }

      console.log('Export:', {
        cropDimensions: { width: cropWidth, height: cropHeight }
      })

      // Convert canvas to blob and copy to clipboard
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas')
          return
        }

        try {
          const item = new ClipboardItem({ 'image/png': blob })
          await navigator.clipboard.write([item])
          console.log('✅ Image copied to clipboard')
        } catch (err) {
          console.error('Failed to copy to clipboard:', err)
        }
      }, 'image/png', 1.0)
    } catch (err) {
      console.error('Copy to clipboard failed:', err)
    }
  }, [cropWidth, cropHeight])

  const handleCopyClick = useCallback(() => {
    if (!imageLoaded) {
      console.warn('No image loaded to copy')
      return
    }

    copyImageToClipboard()
  }, [imageLoaded, copyImageToClipboard])

  const downloadCroppedImage = useCallback(async () => {
    try {
      const canvas = canvasRef.current?.getCroppedCanvas()
      if (!canvas) {
        console.error('Failed to get cropped canvas')
        return
      }

      console.log('Export:', {
        cropDimensions: { width: cropWidth, height: cropHeight }
      })

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas')
          return
        }

        // Create filename with ISO 8601 timestamp
        const now = new Date()
        const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + 'T' + 
                        now.toISOString().split('T')[1].replace(/[:.]/g, '-').substring(0, 9)
        const filename = `croppy-${timestamp}.png`

        // Create download link and trigger download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        console.log(`✅ Image downloaded as ${filename}`)
      }, 'image/png', 1.0)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }, [cropWidth, cropHeight])

  const handleDownloadClick = useCallback(() => {
    if (!imageLoaded) {
      console.warn('No image loaded to download')
      return
    }

    downloadCroppedImage()
  }, [imageLoaded, downloadCroppedImage])

  const handleResetClick = useCallback(() => {
    console.log('Reset position')
    
    // Re-center the image
    if (imageLoaded) {
      const canvasElement = document.querySelector('canvas')
      if (canvasElement) {
        const canvasWidth = canvasElement.width
        const canvasHeight = canvasElement.height
        
        const scaledWidth = originalWidth * scale
        const scaledHeight = originalHeight * scale
        const x = (canvasWidth - scaledWidth) / 2
        const y = (canvasHeight - scaledHeight) / 2
        
        setImagePosition({ x, y })
      }
    }
  }, [imageLoaded, originalWidth, originalHeight, scale])

  const handleRemoveImage = () => {
    console.log('Remove media from canvas')
    setImageLoaded(false)
    setOriginalWidth(0)
    setOriginalHeight(0)
    setImageData(null)
    setVideoData(null)
    setMediaType(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    // Media is removed but user's clipboard is NOT modified
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processMediaBlob(file)
    }
  }

  // Video playback controls
  const handlePlayPause = async () => {
    const video = canvasRef.current?.getVideoElement()
    if (!video) return
    
    try {
      if (video.paused) {
        await video.play()
        setIsPlaying(true)
      } else {
        video.pause()
        setIsPlaying(false)
      }
    } catch (err) {
      console.error('Play/pause failed:', err)
    }
  }

  const handleSeek = (time: number) => {
    const video = canvasRef.current?.getVideoElement()
    if (!video) return
    
    video.currentTime = time
    setCurrentTime(time)
  }

  const handlePreviousFrame = () => {
    const video = canvasRef.current?.getVideoElement()
    if (!video) return
    
    // Assume 30fps, go back 1 frame (1/30 second)
    const frameTime = 1 / 30
    const newTime = Math.max(0, video.currentTime - frameTime)
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleNextFrame = () => {
    const video = canvasRef.current?.getVideoElement()
    if (!video) return
    
    // Assume 30fps, go forward 1 frame (1/30 second)
    const frameTime = 1 / 30
    const newTime = Math.min(video.duration, video.currentTime + frameTime)
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Update current time while video is playing
  useEffect(() => {
    const video = canvasRef.current?.getVideoElement()
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [videoData])

  // Keyboard shortcuts - placed after all handlers are defined
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault()
        setShowHelp(!showHelp)
      }
      
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault()
        handleCopyClick()
      }
      
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleDownloadClick()
      }
      
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        handleResetClick()
      }
      
      // Video playback controls
      if (mediaType === 'video') {
        if (e.code === 'Space') {
          e.preventDefault()
          handlePlayPause()
        }
        
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          handlePreviousFrame()
        }
        
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          handleNextFrame()
        }
      }
    }

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      
      for (const item of items) {
        if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
          e.preventDefault()
          const blob = item.getAsFile()
          if (blob) {
            console.log(`${item.type.startsWith('video/') ? 'Video' : 'Image'} pasted from clipboard`)
            processMediaBlob(blob)
          }
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('paste', handlePaste)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('paste', handlePaste)
    }
  }, [showHelp, imageLoaded, mediaType, handleCopyClick, handleDownloadClick, handleResetClick])

  // Drag and drop support for files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer?.files
    if (!files) return
    
    // Look for image/video files
    for (const file of files) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        processMediaBlob(file)
        return
      }
    }
  }

  return (
    <main className={styles.container}>
      {browserCompatError && (
        <div className={styles.compatWarning}>
          <div className={styles.compatContent}>
            <strong>⚠️ Browser Compatibility Warning</strong>
            <p style={{ whiteSpace: 'pre-line' }}>{browserCompatError}</p>
            <button onClick={() => setBrowserCompatError(null)} className={styles.dismissBtn}>
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      <Canvas 
        ref={canvasRef}
        imageData={imageData}
        videoData={videoData}
        mediaType={mediaType}
        imagePosition={imagePosition}
        cropWidth={cropWidth}
        cropHeight={cropHeight}
        scale={scale}
        rotation={rotation}
        zoomSensitivity={zoomSensitivity}
        onImageLoad={handleImageLoad}
        onVideoLoad={handleVideoLoad}
        onPositionChange={(x, y) => setImagePosition({ x, y })}
        onScaleChange={setScale}
        onCropResize={handleCropResize}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        positionInitialized={positionInitialized}
        isPlaying={isPlaying}
        onTimeUpdate={setCurrentTime}
      >
        {/* Welcome message when no image loaded */}
        {!imageLoaded && (
          <div className={styles.welcomeOverlay}>
            <div className={styles.welcomeContent}>
              <label htmlFor="file-upload" className={styles.uploadButton}>
                Add File
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <p className={styles.orText}>or</p>
              <p className={styles.welcomeTitle}>Press <kbd>Ctrl+V</kbd> to paste an image or video</p>
              <p className={styles.welcomeSubtitle}>Or drag and drop a file (.jpg, .png, .mp4, .webm)</p>
              <p className={styles.welcomeHint}>Press <kbd>H</kbd> for keyboard shortcuts</p>
            </div>
          </div>
        )}
        
        <TopRightMenu 
          onCopyClick={handleCopyClick}
          onDownloadClick={handleDownloadClick}
          onResetClick={handleResetClick}
        />
        <UtilityBar 
          originalWidth={originalWidth}
          originalHeight={originalHeight}
          zoomLevel={Math.round(scale * 100)}
          rotation={rotation}
          outputWidth={cropWidth}
          outputHeight={cropHeight}
          onRotationChange={setRotation}
          onCropResize={handleCropResize}
          onZoomSensitivityChange={setZoomSensitivity}
          onHelpClick={() => setShowHelp(true)}
          onRemoveImage={handleRemoveImage}
          imageLoaded={imageLoaded}
          isVideo={mediaType === 'video'}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onPreviousFrame={handlePreviousFrame}
          onNextFrame={handleNextFrame}
        />
      </Canvas>
      
      <HelpOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </main>
  )
}
