import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useToastStore, type ToastType } from '@/stores/toastStore'
import { cn } from '@/utils'

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-accent',
}

const bgMap: Record<ToastType, string> = {
  success: 'border-success/20 bg-white',
  error: 'border-error/20 bg-white',
  warning: 'border-warning/20 bg-white',
  info: 'border-accent/20 bg-white',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = iconMap[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 48, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-sm pointer-events-auto',
                'max-w-sm w-full',
                bgMap[toast.type]
              )}
              role="alert"
            >
              <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', colorMap[toast.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink leading-snug">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-body mt-0.5 leading-relaxed">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-muted-soft hover:text-ink transition-colors -mt-0.5 -mr-1"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
