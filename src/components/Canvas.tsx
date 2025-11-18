'use client'

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import styles from './Canvas.module.css'

interface CanvasProps {
  children?: React.ReactNode
  imageData?: string | null
  imagePosition: { x: number; y: number }
  cropWidth: number
  cropHeight: number
  scale: number
  rotation?: number
  zoomSensitivity?: number
  onImageLoad?: (width: number, height: number) => void
  onPositionChange?: (x: number, y: number) => void
  onScaleChange?: (scale: number) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}

export interface CanvasRef {
  getCroppedCanvas: () => HTMLCanvasElement | null
  getCanvasState: () => {
    image: HTMLImageElement | null
    position: { x: number; y: number }
    scale: number
    cropBox: { centerX: number; centerY: number; width: number; height: number }
  }
}

const DEFAULT_CROP_BOX_WIDTH = 800
const DEFAULT_CROP_BOX_HEIGHT = 600

const Canvas = forwardRef<CanvasRef, CanvasProps>(({
  children,
  imageData = null,
  imagePosition,
  cropWidth = DEFAULT_CROP_BOX_WIDTH,
  cropHeight = DEFAULT_CROP_BOX_HEIGHT,
  scale,
  rotation = 0,
  zoomSensitivity = 10,
  onImageLoad,
  onPositionChange,
  onScaleChange,
  onDragOver,
  onDrop
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })

  // Load image when imageData changes
  useEffect(() => {
    if (!imageData) {
      imageRef.current = null
      render()
      return
    }

    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      onImageLoad?.(img.naturalWidth, img.naturalHeight)
      render()
    }
    img.src = imageData
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageData])

  // Render canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw image if loaded
    if (imageRef.current) {
      const img = imageRef.current
      const scaledWidth = img.naturalWidth * scale
      const scaledHeight = img.naturalHeight * scale

      if (rotation !== 0) {
        // Save context and apply rotation
        ctx.save()
        const centerX = imagePosition.x + scaledWidth / 2
        const centerY = imagePosition.y + scaledHeight / 2
        ctx.translate(centerX, centerY)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.drawImage(
          img,
          -scaledWidth / 2,
          -scaledHeight / 2,
          scaledWidth,
          scaledHeight
        )
        ctx.restore()
      } else {
        ctx.drawImage(
          img,
          imagePosition.x,
          imagePosition.y,
          scaledWidth,
          scaledHeight
        )
      }
    }

    // Draw crop box
    const cropBoxCenterX = canvasWidth / 2
    const cropBoxCenterY = canvasHeight / 2
    const cropBoxX = cropBoxCenterX - cropWidth / 2
    const cropBoxY = cropBoxCenterY - cropHeight / 2

    // Draw dark overlay outside crop box
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    
    // Top
    ctx.fillRect(0, 0, canvasWidth, cropBoxY)
    // Bottom
    ctx.fillRect(0, cropBoxY + cropHeight, canvasWidth, canvasHeight)
    // Left
    ctx.fillRect(0, cropBoxY, cropBoxX, cropHeight)
    // Right
    ctx.fillRect(cropBoxX + cropWidth, cropBoxY, canvasWidth, cropHeight)

    // Draw white border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.strokeRect(cropBoxX, cropBoxY, cropWidth, cropHeight)
    ctx.restore()
  }, [imagePosition, scale, rotation, cropWidth, cropHeight])

  // Re-render when state changes
  useEffect(() => {
    render()
  }, [render])

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return

      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      render()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [render])

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageRef.current) return
    
    isDraggingRef.current = true
    dragStartRef.current = {
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !imageRef.current) return

    const newX = e.clientX - dragStartRef.current.x
    const newY = e.clientY - dragStartRef.current.y
    
    onPositionChange?.(newX, newY)
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!imageRef.current) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate zoom factor based on sensitivity (convert percentage to decimal)
    const zoomStep = zoomSensitivity / 100
    const direction = e.deltaY > 0 ? -1 : 1
    const newScale = Math.max(0.1, Math.min(5.0, scale + (direction * zoomStep)))

    // Calculate new position to zoom toward mouse cursor
    const scaleRatio = newScale / scale
    const newX = mouseX - (mouseX - imagePosition.x) * scaleRatio
    const newY = mouseY - (mouseY - imagePosition.y) * scaleRatio

    onScaleChange?.(newScale)
    onPositionChange?.(newX, newY)
  }

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getCroppedCanvas: () => {
      const canvas = canvasRef.current
      if (!canvas || !imageRef.current) return null

      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const cropBoxCenterX = canvasWidth / 2
      const cropBoxCenterY = canvasHeight / 2
      const cropBoxX = cropBoxCenterX - cropWidth / 2
      const cropBoxY = cropBoxCenterY - cropHeight / 2

      // Create export canvas
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = cropWidth
      exportCanvas.height = cropHeight
      const ctx = exportCanvas.getContext('2d')
      if (!ctx) return null

      if (rotation !== 0) {
        // For rotated images, we need to render the rotated image first
        // then crop from the center of that rotated render
        const img = imageRef.current
        const scaledWidth = img.naturalWidth * scale
        const scaledHeight = img.naturalHeight * scale

        // Calculate where the rotated image center is relative to crop box
        const imageCenterX = imagePosition.x + scaledWidth / 2
        const imageCenterY = imagePosition.y + scaledHeight / 2
        
        // Offset from crop box center to image center
        const offsetX = imageCenterX - cropBoxCenterX
        const offsetY = imageCenterY - cropBoxCenterY

        // Draw rotated image centered in export canvas
        ctx.save()
        ctx.translate(cropWidth / 2 - offsetX, cropHeight / 2 - offsetY)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.drawImage(
          img,
          -scaledWidth / 2,
          -scaledHeight / 2,
          scaledWidth,
          scaledHeight
        )
        ctx.restore()
      } else {
        // No rotation - use simple rectangular crop
        const sourceX = (cropBoxX - imagePosition.x) / scale
        const sourceY = (cropBoxY - imagePosition.y) / scale
        const sourceWidth = cropWidth / scale
        const sourceHeight = cropHeight / scale

        ctx.drawImage(
          imageRef.current,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          cropWidth,
          cropHeight
        )
      }

      return exportCanvas
    },
    getCanvasState: () => {
      const canvas = canvasRef.current
      if (!canvas) {
        return {
          image: null,
          position: { x: 0, y: 0 },
          scale: 1,
          cropBox: { centerX: 0, centerY: 0, width: cropWidth, height: cropHeight }
        }
      }

      return {
        image: imageRef.current,
        position: imagePosition,
        scale,
        cropBox: {
          centerX: canvas.width / 2,
          centerY: canvas.height / 2,
          width: cropWidth,
          height: cropHeight
        }
      }
    }
  }))

  return (
    <div 
      className={styles.container}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      {children}
    </div>
  )
})

Canvas.displayName = 'Canvas'

export default Canvas
export { DEFAULT_CROP_BOX_WIDTH, DEFAULT_CROP_BOX_HEIGHT }
