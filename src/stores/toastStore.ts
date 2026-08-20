import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 4000 }
    set(state => ({ toasts: [...state.toasts, newToast] }))
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => get().removeToast(id), newToast.duration)
    }
  },
  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
  },
  clearAll: () => set({ toasts: [] }),
}))

// Convenience helpers
export function toast(type: ToastType, title: string, message?: string, duration?: number) {
  useToastStore.getState().addToast({ type, title, message, duration })
}

export const toastSuccess = (title: string, message?: string) => toast('success', title, message)
export const toastError = (title: string, message?: string) => toast('error', title, message)
export const toastWarning = (title: string, message?: string) => toast('warning', title, message)
export const toastInfo = (title: string, message?: string) => toast('info', title, message)
