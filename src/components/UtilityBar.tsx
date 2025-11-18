'use client'

import styles from './UtilityBar.module.css'

interface UtilityBarProps {
  originalWidth?: number
  originalHeight?: number
  zoomLevel: number
  rotation?: number
  outputWidth: number
  outputHeight: number
  onRotationChange?: (rotation: number) => void
}

export default function UtilityBar({
  originalWidth = 0,
  originalHeight = 0,
  zoomLevel,
  rotation = 0,
  outputWidth,
  outputHeight,
  onRotationChange,
}: UtilityBarProps) {
  const formatDimensions = (width: number, height: number) => {
    if (width === 0 || height === 0) return '—'
    return `${width} × ${height}`
  }

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    onRotationChange?.(value)
  }

  return (
    <div className={styles.barContainer}>
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
        <div className={styles.section}>
          <span className={styles.label}>Original Size:</span>
          <span className={styles.value}>{formatDimensions(originalWidth, originalHeight)}</span>
        </div>
        
        <div className={styles.section}>
          <span className={styles.label}>Zoom:</span>
          <span className={styles.value}>{Math.round(zoomLevel)}%</span>
          <span className={styles.separator}>|</span>
          <span className={styles.label}>Rotation:</span>
          <span className={styles.value}>{rotation}°</span>
        </div>
        
        <div className={styles.section}>
          <span className={styles.label}>Output:</span>
          <span className={styles.value}>{formatDimensions(outputWidth, outputHeight)}</span>
        </div>
      </div>
    </div>
  )
}
