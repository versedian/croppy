'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import TopLeftMenu from '@/components/TopLeftMenu'
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

  // Process image blob from any source
  const processImageBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    console.log('Created object URL from blob:', url)
    
    const img = new Image()
    img.onload = () => {
      console.log(`Image loaded: ${img.naturalWidth} x ${img.naturalHeight}`)
      setImageData(url)
      console.log('✅ Image pasted successfully!')
    }
    img.onerror = () => {
      console.error('Failed to load image blob')
      URL.revokeObjectURL(url)
      alert('Failed to load image. Please try again.')
    }
    img.src = url
  }

  // Handle image load from canvas
  const handleImageLoad = (width: number, height: number) => {
    setOriginalWidth(width)
    setOriginalHeight(height)
    setImageLoaded(true)
    setRotation(0) // Reset rotation on new image
    
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
    }
  }

  const handlePositionChange = (width: number, height: number) => {
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
    console.log('Remove image from canvas')
    setImageLoaded(false)
    setOriginalWidth(0)
    setOriginalHeight(0)
    setImageData(null)
    // Image is removed but user's clipboard is NOT modified
  }

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
    }

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const blob = item.getAsFile()
          if (blob) {
            console.log('Image pasted from clipboard')
            processImageBlob(blob)
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
  }, [showHelp, imageLoaded, handleCopyClick, handleDownloadClick, handleResetClick])

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
    
    // Look for image files
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        processImageBlob(file)
        return
      }
    }
  }

  return (
    <main className={styles.container}>
      <Canvas 
        ref={canvasRef}
        imageData={imageData}
        imagePosition={imagePosition}
        cropWidth={cropWidth}
        cropHeight={cropHeight}
        scale={scale}
        rotation={rotation}
        zoomSensitivity={zoomSensitivity}
        onImageLoad={handleImageLoad}
        onPositionChange={(x, y) => setImagePosition({ x, y })}
        onScaleChange={setScale}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Welcome message when no image loaded */}
        {!imageLoaded && (
          <div className={styles.welcomeOverlay}>
            <div className={styles.welcomeContent}>
              <p className={styles.welcomeTitle}>Press <kbd>Ctrl+V</kbd> to paste an image</p>
              <p className={styles.welcomeSubtitle}>Or drag and drop an image file</p>
              <p className={styles.welcomeHint}>Press <kbd>H</kbd> for keyboard shortcuts</p>
            </div>
          </div>
        )}
        
        <TopLeftMenu 
          onPositionChange={handlePositionChange}
          onHelpClick={() => setShowHelp(true)}
          onRemoveImage={handleRemoveImage}
          imageLoaded={imageLoaded}
          onZoomSensitivityChange={setZoomSensitivity}
        />
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
        />
      </Canvas>
      
      <HelpOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </main>
  )
}
