import * as RadixSlider from '@radix-ui/react-slider'
import { cn } from '@/utils'

interface SliderProps {
  label?: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  showValue?: boolean
  unit?: string
  className?: string
  dark?: boolean
}

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  showValue = true,
  unit = '',
  className,
  dark = false,
}: SliderProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className={cn('text-xs font-medium', dark ? 'text-editor-muted' : 'text-muted')}>
              {label}
            </span>
          )}
          {showValue && (
            <span className={cn('text-xs font-mono tabular-nums', dark ? 'text-editor-text' : 'text-ink')}>
              {value}{unit}
            </span>
          )}
        </div>
      )}
      <RadixSlider.Root
        className="relative flex items-center h-5 cursor-pointer select-none touch-none w-full"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      >
        <RadixSlider.Track
          className={cn(
            'relative flex-1 rounded-full h-1',
            dark ? 'bg-editor-surface' : 'bg-surface-strong'
          )}
        >
          <RadixSlider.Range
            className="absolute h-full rounded-full bg-accent"
          />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className={cn(
            'block w-4 h-4 rounded-full border-2 border-accent bg-white shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
            'hover:scale-110 transition-transform',
            dark && 'focus-visible:ring-offset-editor-bg'
          )}
        />
      </RadixSlider.Root>
    </div>
  )
}

// Property slider variant with inline display
interface PropertySliderProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  unit?: string
  dark?: boolean
}

export function PropertySlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  unit = '',
  dark = true,
}: PropertySliderProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn('text-xs w-20 shrink-0 truncate', dark ? 'text-editor-muted' : 'text-muted')}>
        {label}
      </span>
      <RadixSlider.Root
        className="relative flex items-center h-5 cursor-pointer select-none touch-none flex-1"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      >
        <RadixSlider.Track
          className={cn('relative flex-1 rounded-full h-1', dark ? 'bg-editor-surface' : 'bg-surface-strong')}
        >
          <RadixSlider.Range className="absolute h-full rounded-full bg-accent" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className="block w-3.5 h-3.5 rounded-full border-2 border-accent bg-white focus-visible:outline-none"
        />
      </RadixSlider.Root>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className={cn(
          'w-12 text-xs text-right font-mono px-1 py-0.5 rounded border',
          dark
            ? 'bg-editor-surface text-editor-text border-editor-border'
            : 'bg-surface-card text-ink border-hairline'
        )}
      />
      {unit && (
        <span className={cn('text-xs w-4 shrink-0', dark ? 'text-editor-muted' : 'text-muted')}>
          {unit}
        </span>
      )}
    </div>
  )
}
