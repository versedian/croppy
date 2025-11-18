'use client'

import { useState, useEffect } from 'react'
import PresetsDropdown from './PresetsDropdown'
import styles from './TopLeftMenu.module.css'

interface TopLeftMenuProps {
  onPositionChange: (width: number, height: number) => void
  onHelpClick?: () => void
  onRemoveImage?: () => void
  imageLoaded?: boolean
  initialX?: number
  initialY?: number
  onZoomSensitivityChange?: (sensitivity: number) => void
}

export default function TopLeftMenu({ 
  onPositionChange, 
  onHelpClick,
  onRemoveImage,
  imageLoaded = false,
  initialX = 0, 
  initialY = 0,
  onZoomSensitivityChange
}: TopLeftMenuProps) {
  // Load from localStorage on mount, fall back to defaults (832 x 1216)
  const [x, setX] = useState<string>(() => {
    if (typeof window === 'undefined') return '0'
    const saved = localStorage.getItem('croppy_lastX')
    return saved !== null ? saved : '832'
  })
  const [y, setY] = useState<string>(() => {
    if (typeof window === 'undefined') return '0'
    const saved = localStorage.getItem('croppy_lastY')
    return saved !== null ? saved : '1216'
  })

  // Zoom sensitivity state (1-20% per scroll step) - default 10, load from localStorage after mount
  const [zoomSensitivity, setZoomSensitivity] = useState<number>(10)

  // Load from localStorage on mount
  useEffect(() => {
    const savedX = localStorage.getItem('croppy_lastX')
    const savedY = localStorage.getItem('croppy_lastY')
    const savedZoom = localStorage.getItem('croppy_zoomSensitivity')
    
    if (savedX !== null && savedY !== null) {
      onPositionChange(parseInt(savedX), parseInt(savedY))
    }
    if (savedZoom !== null) {
      const zoomValue = parseInt(savedZoom)
      setZoomSensitivity(zoomValue)
      onZoomSensitivityChange?.(zoomValue)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setX(value)
    
    // Only save if it's a valid number
    if (value === '' || !isNaN(parseInt(value))) {
      localStorage.setItem('croppy_lastX', value || '0')
      if (value !== '') {
        onPositionChange(parseInt(value), parseInt(y || '0'))
      }
    }
  }

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setY(value)
    
    // Only save if it's a valid number
    if (value === '' || !isNaN(parseInt(value))) {
      localStorage.setItem('croppy_lastY', value || '0')
      if (value !== '') {
        onPositionChange(parseInt(x || '0'), parseInt(value))
      }
    }
  }

  const handlePresetSelect = (width: number, height: number) => {
    setX(width.toString())
    setY(height.toString())
    localStorage.setItem('croppy_lastX', width.toString())
    localStorage.setItem('croppy_lastY', height.toString())
    onPositionChange(width, height)
  }

  const handleZoomSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setZoomSensitivity(value)
    localStorage.setItem('croppy_zoomSensitivity', value.toString())
    onZoomSensitivityChange?.(value)
  }

  return (
    <div className={styles.menuContainer}>
      <div className={styles.menu}>
      <div className={styles.controlGroup}>
        <label htmlFor="crop-x">W:</label>
        <input
          id="crop-x"
          type="number"
          value={x}
          onChange={handleXChange}
          placeholder="0"
          className={styles.input}
        />
      </div>
      <div className={styles.controlGroup}>
        <label htmlFor="crop-y">H:</label>
        <input
          id="crop-y"
          type="number"
          value={y}
          onChange={handleYChange}
          placeholder="0"
          className={styles.input}
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
      
      {/* Zoom Sensitivity Slider */}
      <div className={styles.zoomControl}>
        <label htmlFor="zoom-sensitivity" className={styles.zoomLabel}>
          Zoom: {zoomSensitivity}%
        </label>
        <input
          id="zoom-sensitivity"
          type="range"
          min="1"
          max="20"
          value={zoomSensitivity}
          onChange={handleZoomSensitivityChange}
          className={styles.slider}
          title="Zoom sensitivity (% per scroll step)"
        />
      </div>
      
      {/* Presets Dropdown */}
      <PresetsDropdown onPresetSelect={handlePresetSelect} />
    </div>
  )
}
