import { useState, useRef, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import { cn } from '@/utils'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
  dark?: boolean
}

const PRESET_COLORS = [
  '#ffffff', '#f5f4f0', '#e8e7e1', '#1a1917', '#55534e', '#7e7b72',
  '#6c47ff', '#5534e0', '#f0ecff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6',
  'transparent',
]

export function ColorPicker({ value, onChange, className, dark = false }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value)

  useEffect(() => {
    setHexInput(value === 'transparent' ? 'transparent' : value)
  }, [value])

  const handleHexChange = (hex: string) => {
    setHexInput(hex)
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onChange(hex)
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Color picker */}
      <div className="[&_.react-colorful]:w-full [&_.react-colorful__saturation]:rounded-md [&_.react-colorful__hue]:rounded-full [&_.react-colorful__hue]:mt-2">
        {value !== 'transparent' && (
          <HexColorPicker
            color={value.startsWith('#') ? value : '#6c47ff'}
            onChange={onChange}
          />
        )}
      </div>

      {/* Hex input */}
      <div className="flex gap-2">
        <div
          className="w-8 h-8 rounded border border-hairline shrink-0 checkerboard"
          style={{ backgroundColor: value === 'transparent' ? undefined : value }}
          aria-hidden
        />
        <input
          type="text"
          value={hexInput}
          onChange={e => handleHexChange(e.target.value)}
          className={cn(
            'flex-1 text-xs font-mono px-2 py-1 rounded border',
            dark
              ? 'bg-editor-surface text-editor-text border-editor-border'
              : 'bg-surface-card text-ink border-hairline'
          )}
          placeholder="#000000"
          aria-label="Hex color value"
          spellCheck={false}
        />
      </div>

      {/* Preset swatches */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map(color => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              'w-6 h-6 rounded border transition-transform hover:scale-110',
              color === value ? 'border-accent ring-1 ring-accent' : 'border-hairline',
              color === 'transparent' && 'checkerboard'
            )}
            style={{ backgroundColor: color === 'transparent' ? undefined : color }}
            aria-label={color === 'transparent' ? 'Transparent' : color}
            title={color === 'transparent' ? 'Transparent' : color}
          />
        ))}
      </div>
    </div>
  )
}

// Compact color swatch button (for inline use)
interface ColorSwatchProps {
  color: string
  onClick?: () => void
  size?: 'sm' | 'md'
  className?: string
  label?: string
}

export function ColorSwatch({ color, onClick, size = 'md', className, label }: ColorSwatchProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded border border-hairline-strong hover:border-accent transition-colors',
        size === 'sm' ? 'w-5 h-5' : 'w-6 h-6',
        color === 'transparent' && 'checkerboard',
        className
      )}
      style={{ backgroundColor: color === 'transparent' ? undefined : color }}
      aria-label={label ?? `Color: ${color}`}
      title={color}
    />
  )
}

// Popover color picker (used in properties panel)
interface PopoverColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  dark?: boolean
  className?: string
}

export function PopoverColorPicker({ value, onChange, label, dark = true, className }: PopoverColorPickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className={cn('relative', className)} ref={ref}>
      <div className="flex items-center gap-2">
        {label && <span className={cn('text-xs', dark ? 'text-editor-muted' : 'text-muted')}>{label}</span>}
        <button
          onClick={() => setOpen(v => !v)}
          className={cn(
            'w-7 h-7 rounded border transition-colors hover:border-accent',
            dark ? 'border-editor-border' : 'border-hairline-strong',
            value === 'transparent' && 'checkerboard'
          )}
          style={{ backgroundColor: value === 'transparent' ? undefined : value }}
          aria-label={`Pick color: ${value}`}
          aria-expanded={open}
        />
        <span className={cn('text-xs font-mono', dark ? 'text-editor-muted' : 'text-muted')}>
          {value === 'transparent' ? 'None' : value}
        </span>
      </div>

      {open && (
        <div className={cn(
          'absolute z-50 top-full mt-1 left-0 p-3 rounded-lg border shadow-lg w-56',
          dark ? 'bg-editor-panel border-editor-border' : 'bg-white border-hairline'
        )}>
          <ColorPicker value={value} onChange={onChange} dark={dark} />
        </div>
      )}
    </div>
  )
}
