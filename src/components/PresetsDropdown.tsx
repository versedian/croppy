'use client'

import { useState, useEffect } from 'react'
import styles from './PresetsDropdown.module.css'

interface Preset {
  id: string
  name: string
  width: number
  height: number
}

interface PresetsDropdownProps {
  onPresetSelect?: (width: number, height: number) => void
  expandUp?: boolean
}

const DEFAULT_PRESETS: Preset[] = [
  { id: 'preset-portrait', name: 'Portrait', width: 832, height: 1216 },
  { id: 'preset-grok-portrait', name: 'Grok Portrait', width: 832, height: 1248 },
  { id: 'preset-grok-square', name: 'Grok Square', width: 960, height: 960 },
  { id: 'preset-grok-landscape', name: 'Grok Landscape', width: 640, height: 480 },
]

export default function PresetsDropdown({ onPresetSelect, expandUp = false }: PresetsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isAddingPreset, setIsAddingPreset] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetWidth, setNewPresetWidth] = useState('')
  const [newPresetHeight, setNewPresetHeight] = useState('')

  // Load custom presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('croppy_customPresets')
    if (saved) {
      try {
        const customPresets = JSON.parse(saved)
        setPresets([...DEFAULT_PRESETS, ...customPresets])
      } catch (e) {
        console.error('Failed to load custom presets', e)
      }
    }
  }, [])

  // Save custom presets to localStorage
  const savePresetsToStorage = (allPresets: Preset[]) => {
    const custom = allPresets.filter(p => !p.id.startsWith('preset-'))
    localStorage.setItem('croppy_customPresets', JSON.stringify(custom))
  }

  const handleAddPreset = () => {
    if (!newPresetName.trim() || !newPresetWidth || !newPresetHeight) return

    const newPreset: Preset = {
      id: `custom-${Date.now()}`,
      name: newPresetName,
      width: parseInt(newPresetWidth),
      height: parseInt(newPresetHeight),
    }

    const updated = [...presets, newPreset]
    setPresets(updated)
    savePresetsToStorage(updated)
    
    setNewPresetName('')
    setNewPresetWidth('')
    setNewPresetHeight('')
    setIsAddingPreset(false)
  }

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id)
    setPresets(updated)
    savePresetsToStorage(updated)
    setDeleteConfirm(null)
  }

  const handleDragStart = (id: string) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return

    const draggedIndex = presets.findIndex(p => p.id === draggedId)
    const targetIndex = presets.findIndex(p => p.id === targetId)

    const updated = [...presets]
    const [removed] = updated.splice(draggedIndex, 1)
    updated.splice(targetIndex, 0, removed)

    setPresets(updated)
    savePresetsToStorage(updated)
    setDraggedId(null)
  }

  const handleSelectPreset = (preset: Preset) => {
    onPresetSelect?.(preset.width, preset.height)
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle presets"
      >
        Presets {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div className={`${styles.dropdown} ${expandUp ? styles.dropdownUp : ''}`}>
          <button className={styles.addButton} onClick={() => setIsAddingPreset(!isAddingPreset)}>
            + Add Preset
          </button>

          {isAddingPreset && (
            <div className={styles.addForm}>
              <input
                type="text"
                placeholder="Preset name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className={styles.input}
              />
              <div className={styles.dimensionInputs}>
                <input
                  type="number"
                  placeholder="Width"
                  value={newPresetWidth}
                  onChange={(e) => setNewPresetWidth(e.target.value)}
                  className={styles.input}
                />
                <input
                  type="number"
                  placeholder="Height"
                  value={newPresetHeight}
                  onChange={(e) => setNewPresetHeight(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formButtons}>
                <button className={styles.saveButton} onClick={handleAddPreset}>
                  Save
                </button>
                <button className={styles.cancelButton} onClick={() => setIsAddingPreset(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className={styles.presetsList}>
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={styles.presetItem}
                draggable
                onDragStart={() => handleDragStart(preset.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(preset.id)}
              >
                <div className={styles.dragHandle} title="Drag to reorder">⋮</div>
                <button className={styles.presetButton} onClick={() => handleSelectPreset(preset)}>
                  {preset.name} ({preset.width}×{preset.height})
                </button>
                <div className={styles.deleteContainer}>
                  {deleteConfirm === preset.id ? (
                    <div className={styles.confirmPrompt}>
                      <button className={styles.yesButton} onClick={() => handleDeletePreset(preset.id)}>
                        Yes
                      </button>
                      <button className={styles.noButton} onClick={() => setDeleteConfirm(null)}>
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      className={styles.deleteButton}
                      onClick={() => setDeleteConfirm(preset.id)}
                      title="Delete preset"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
