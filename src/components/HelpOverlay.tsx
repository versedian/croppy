'use client'

import { useState } from 'react'
import styles from './HelpOverlay.module.css'

interface HelpOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  { action: 'Paste Clipboard Image/Video', key: 'Ctrl+V' },
  { action: 'Copy to Clipboard', key: 'Ctrl+C' },
  { action: 'Download as PNG', key: 'Ctrl+S' },
  { action: 'Reset Position', key: 'R' },
  { action: 'Toggle Help', key: 'H' },
  { section: 'Video Controls' },
  { action: 'Play/Pause Video', key: 'Space' },
  { action: 'Previous Frame', key: '← Left Arrow' },
  { action: 'Next Frame', key: '→ Right Arrow' },
]

export default function HelpOverlay({ isOpen, onClose }: HelpOverlayProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Keyboard Shortcuts</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.shortcuts}>
          {shortcuts.map((shortcut, index) => {
            if ('section' in shortcut) {
              return (
                <div key={index} className={styles.sectionHeader}>
                  {shortcut.section}
                </div>
              )
            }
            return (
              <div key={index} className={styles.shortcutRow}>
                <span className={styles.action}>{shortcut.action}</span>
                <span className={styles.key}>{shortcut.key}</span>
              </div>
            )
          })}
        </div>
        <div className={styles.notes}>
          <p><strong>Notes:</strong></p>
          <p>All processing happens locally - no uploads</p>
          <p>Exported images have metadata automatically stripped</p>
          <p>Supports .mp4, .webm videos and common image formats</p>
        </div>
      </div>
    </div>
  )
}
