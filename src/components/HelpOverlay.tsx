'use client'

import { useState } from 'react'
import styles from './HelpOverlay.module.css'

interface HelpOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  { action: 'Paste Clipboard Image', key: 'Ctrl+V' },
  { action: 'Copy to Clipboard', key: 'Ctrl+C' },
  { action: 'Download as PNG', key: 'Ctrl+S' },
  { action: 'Reset Position', key: 'R' },
  { action: 'Toggle Help', key: 'H' },
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
          {shortcuts.map((shortcut, index) => (
            <div key={index} className={styles.shortcutRow}>
              <span className={styles.action}>{shortcut.action}</span>
              <span className={styles.key}>{shortcut.key}</span>
            </div>
          ))}
        </div>
        <div className={styles.notes}>
          <p><strong>Notes:</strong></p>
          <p>All processing happens locally - no uploads</p>
          <p>Exported images have metadata automatically stripped</p>
        </div>
      </div>
    </div>
  )
}
