import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils'
import * as Tooltip from '@radix-ui/react-tooltip'

type IconButtonVariant = 'ghost' | 'surface' | 'dark-ghost' | 'dark-surface' | 'accent'
type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  tooltip?: string
  variant?: IconButtonVariant
  size?: IconButtonSize
  active?: boolean
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
}

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: 'bg-transparent text-body hover:bg-surface-strong hover:text-ink',
  surface: 'bg-surface-card text-ink border border-hairline hover:border-hairline-strong',
  'dark-ghost': 'bg-transparent text-editor-muted hover:bg-editor-surface hover:text-editor-text',
  'dark-surface': 'bg-editor-surface text-editor-text border border-editor-border hover:border-editor-text/30',
  accent: 'bg-accent text-white hover:bg-accent-active',
}

const sizeClasses: Record<IconButtonSize, string> = {
  xs: 'h-6 w-6 rounded',
  sm: 'h-7 w-7 rounded-md',
  md: 'h-8 w-8 rounded-md',
  lg: 'h-10 w-10 rounded-md',
}

const activeClasses: Record<IconButtonVariant, string> = {
  ghost: 'bg-accent-subtle text-accent',
  surface: 'bg-accent-subtle text-accent border-accent/30',
  'dark-ghost': 'bg-accent/20 text-accent',
  'dark-surface': 'bg-accent/20 text-accent border-accent/40',
  accent: 'bg-accent-active',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  tooltip,
  variant = 'ghost',
  size = 'md',
  active = false,
  tooltipSide = 'right',
  className,
  disabled,
  ...props
}, ref) => {
  const button = (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center transition-colors duration-150 shrink-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        variantClasses[variant],
        sizeClasses[size],
        active && activeClasses[variant],
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={disabled}
      aria-label={tooltip}
      {...props}
    >
      {icon}
    </button>
  )

  if (!tooltip) return button

  return (
    <Tooltip.Root delayDuration={600}>
      <Tooltip.Trigger asChild>{button}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side={tooltipSide}
          sideOffset={6}
          className="z-50 px-2 py-1 text-xs font-medium bg-ink text-canvas rounded shadow-sm animate-fade-in"
        >
          {tooltip}
          <Tooltip.Arrow className="fill-ink" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
})

IconButton.displayName = 'IconButton'
