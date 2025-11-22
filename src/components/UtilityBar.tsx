'use client'

import { useState, useEffect } from 'react'
import PresetsDropdown from './PresetsDropdown'
import styles from './UtilityBar.module.css'

interface UtilityBarProps {
  originalWidth?: number
  originalHeight?: number
  zoomLevel: number
  rotation?: number
  outputWidth: number
  outputHeight: number
  onRotationChange?: (rotation: number) => void
  onCropResize?: (width: number, height: number) => void
  onZoomSensitivityChange?: (sensitivity: number) => void
  onHelpClick?: () => void
  onRemoveImage?: () => void
  imageLoaded?: boolean
  // Video controls
  isVideo?: boolean
  isPlaying?: boolean
  currentTime?: number
  duration?: number
  onPlayPause?: () => void
  onSeek?: (time: number) => void
  onPreviousFrame?: () => void
  onNextFrame?: () => void
}

export default function UtilityBar({
  originalWidth = 0,
  originalHeight = 0,
  zoomLevel,
  rotation = 0,
  outputWidth,
  outputHeight,
  onRotationChange,
  onCropResize,
  onZoomSensitivityChange,
  onHelpClick,
  onRemoveImage,
  imageLoaded = false,
  isVideo = false,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  onPlayPause,
  onSeek,
  onPreviousFrame,
  onNextFrame,
}: UtilityBarProps) {
  // W × H input fields state
  const [width, setWidth] = useState<string>(() => {
    if (typeof window === 'undefined') return '832'
    const saved = localStorage.getItem('croppy_lastX')
    return saved !== null ? saved : '832'
  })
  const [height, setHeight] = useState<string>(() => {
    if (typeof window === 'undefined') return '1216'
    const saved = localStorage.getItem('croppy_lastY')
    return saved !== null ? saved : '1216'
  })

  // Zoom sensitivity state
  const [zoomSensitivity, setZoomSensitivity] = useState<number>(10)

  // Load from localStorage on mount
  useEffect(() => {
    const savedX = localStorage.getItem('croppy_lastX')
    const savedY = localStorage.getItem('croppy_lastY')
    const savedZoom = localStorage.getItem('croppy_zoomSensitivity')
    
    if (savedX !== null && savedY !== null) {
      onCropResize?.(parseInt(savedX), parseInt(savedY))
    }
    if (savedZoom !== null) {
      const zoomValue = parseInt(savedZoom)
      setZoomSensitivity(zoomValue)
      onZoomSensitivityChange?.(zoomValue)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update local state when external props change
  useEffect(() => {
    setWidth(outputWidth.toString())
    localStorage.setItem('croppy_lastX', outputWidth.toString())
  }, [outputWidth])

  useEffect(() => {
    setHeight(outputHeight.toString())
    localStorage.setItem('croppy_lastY', outputHeight.toString())
  }, [outputHeight])

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWidth(value)
    
    if (value === '' || !isNaN(parseInt(value))) {
      localStorage.setItem('croppy_lastX', value || '0')
      if (value !== '') {
        onCropResize?.(parseInt(value), parseInt(height || '0'))
      }
    }
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setHeight(value)
    
    if (value === '' || !isNaN(parseInt(value))) {
      localStorage.setItem('croppy_lastY', value || '0')
      if (value !== '') {
        onCropResize?.(parseInt(width || '0'), parseInt(value))
      }
    }
  }

  const handleZoomSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setZoomSensitivity(value)
    localStorage.setItem('croppy_zoomSensitivity', value.toString())
    onZoomSensitivityChange?.(value)
  }

  const handlePresetSelect = (w: number, h: number) => {
    setWidth(w.toString())
    setHeight(h.toString())
    localStorage.setItem('croppy_lastX', w.toString())
    localStorage.setItem('croppy_lastY', h.toString())
    onCropResize?.(w, h)
  }

  const formatDimensions = (w: number, h: number) => {
    if (w === 0 || h === 0) return '—'
    return `${w} × ${h}`
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    onRotationChange?.(value)
  }

  return (
    <div className={styles.barContainer}>
      {/* Video Controls Row (only shown for videos) */}
      {isVideo && (
        <div className={styles.videoControls}>
          <button
            className={styles.frameButton}
            onClick={onPreviousFrame}
            title="Previous frame (← key)"
          >
            ◄
          </button>
          
          <button
            className={styles.playButton}
            onClick={onPlayPause}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <button
            className={styles.frameButton}
            onClick={onNextFrame}
            title="Next frame (→ key)"
          >
            ►
          </button>
          
          <div className={styles.timeDisplay}>
            <span className={styles.currentTime}>{formatTime(currentTime)}</span>
            <span className={styles.timeSeparator}>/</span>
            <span className={styles.totalTime}>{formatTime(duration)}</span>
          </div>
          
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.016"
            value={currentTime}
            onChange={(e) => onSeek?.(parseFloat(e.target.value))}
            className={styles.seekSlider}
            title="Seek video"
          />
        </div>
      )}
      
      {/* Rotation Slider Row */}
      <div className={styles.rotationRow}>
        <input
          id="rotation-slider"
          type="range"
          min="-180"
          max="180"
          value={rotation}
          onChange={handleRotationChange}
          className={styles.rotationSlider}
          title="Rotate image"
        />
      </div>
      
      {/* Info Bar Row */}
      <div className={styles.bar}>
        {/* Left Section: Original Size */}
        <div className={styles.leftSection}>
          <span className={styles.label}>Original Size:</span>
          <span className={styles.value}>{formatDimensions(originalWidth, originalHeight)}</span>
        </div>
        
        {/* Center Section: Zoom Sensitivity, Zoom %, Rotation */}
        <div className={styles.centerSection}>
          <span className={styles.label}>Zoom Sensitivity:</span>
          <input
            id="zoom-sensitivity"
            type="range"
            min="1"
            max="20"
            value={zoomSensitivity}
            onChange={handleZoomSensitivityChange}
            className={styles.zoomSlider}
            title="Zoom sensitivity (% per scroll step)"
          />
          <span className={styles.zoomValue}>{zoomSensitivity}%</span>
          
          <span className={styles.separator}>|</span>
          
          <span className={styles.label}>Zoom:</span>
          <span className={styles.value}>{Math.round(zoomLevel)}%</span>
          
          <span className={styles.separator}>|</span>
          
          <span className={styles.label}>Rotation:</span>
          <span className={styles.value}>{rotation}°</span>
        </div>
        
        {/* Right Section: W × H fields, Help, Remove */}
        <div className={styles.rightSection}>
          <div className={styles.dimensionInputs}>
            <span className={styles.label}>W:</span>
            <input
              type="number"
              value={width}
              onChange={handleWidthChange}
              className={styles.dimensionInput}
              title="Output width"
            />
            <span className={styles.dimensionSeparator}>×</span>
            <span className={styles.label}>H:</span>
            <input
              type="number"
              value={height}
              onChange={handleHeightChange}
              className={styles.dimensionInput}
              title="Output height"
            />
          </div>

          {/* Help Button */}
          <button
            className={styles.helpButton}
            onClick={onHelpClick}
            title="Help (? key)"
            aria-label="Open help overlay"
          >
            ?
          </button>

          {/* Remove Image Button */}
          {imageLoaded && (
            <button
              className={styles.removeButton}
              onClick={onRemoveImage}
              title="Remove image"
              aria-label="Remove current image"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* Presets Dropdown - positioned outside top-right of bar */}
      <div className={styles.presetsContainer}>
        <PresetsDropdown onPresetSelect={handlePresetSelect} expandUp={true} />
      </div>
    </div>
  )
}
