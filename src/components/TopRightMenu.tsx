'use client'

import { ClipboardIcon, DownloadIcon, ResetIcon } from './Icons'
import styles from './TopRightMenu.module.css'

interface TopRightMenuProps {
  onCopyClick?: () => void
  onDownloadClick?: () => void
  onResetClick?: () => void
}

export default function TopRightMenu({
  onCopyClick,
  onDownloadClick,
  onResetClick,
}: TopRightMenuProps) {
  return (
    <div className={styles.menu}>
      <button
        className={styles.button}
        onClick={onCopyClick}
        title="Copy to Clipboard (Ctrl+C)"
        aria-label="Copy crop to clipboard"
      >
        <ClipboardIcon size={20} />
      </button>
      
      <button
        className={styles.button}
        onClick={onDownloadClick}
        title="Download as PNG (Ctrl+S)"
        aria-label="Download crop as PNG"
      >
        <DownloadIcon size={20} />
      </button>
      
      <button
        className={styles.button}
        onClick={onResetClick}
        title="Reset Position (R)"
        aria-label="Reset crop position"
      >
        <ResetIcon size={20} />
      </button>
    </div>
  )
}
