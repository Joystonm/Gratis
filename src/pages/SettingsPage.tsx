import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Sparkles, Save, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getCloudinaryConfig } from '@/services/cloudinary/cloudinaryService'
import { toastSuccess } from '@/stores/toastStore'

export function SettingsPage() {
  const navigate = useNavigate()
  const [cloudName, setCloudName] = useState('')
  const [uploadPreset, setUploadPreset] = useState('')
  const [showPreset, setShowPreset] = useState(false)

  useEffect(() => {
    const config = getCloudinaryConfig()
    setCloudName(config.cloudName)
    setUploadPreset(config.uploadPreset)
  }, [])

  function handleSave() {
    // In a real app, you'd persist to localStorage
    // Since VITE_ vars are compile-time, this is for display purposes
    toastSuccess('Settings noted', 'Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file to configure Cloudinary')
  }

  const config = getCloudinaryConfig()

  return (
    <div className="min-h-screen bg-canvas">
      <header className="bg-canvas border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-body hover:text-ink transition-colors">
            <ChevronLeft className="w-4 h-4" /> Home
          </button>
          <div className="h-4 w-px bg-hairline" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-ink">Settings</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-normal text-ink tracking-tight mb-2">Settings</h1>
        <p className="text-body mb-10">Configure Gratis to enable cloud-powered features.</p>

        {/* Cloudinary config */}
        <section className="bg-surface-card rounded-xl border border-hairline p-6 mb-6">
          <h2 className="text-base font-semibold text-ink mb-1">Cloudinary Configuration</h2>
          <p className="text-sm text-body mb-4">
            Cloudinary enables cloud image storage, AI transformations, and CDN delivery.
            Uses only{' '}
            <span className="font-mono text-accent text-xs">unsigned uploads</span> — no API secret required.
          </p>

          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-4 ${config.isConfigured ? 'bg-success/10 text-success' : 'bg-surface-strong text-muted'}`}>
            <div className={`w-2 h-2 rounded-full ${config.isConfigured ? 'bg-success' : 'bg-muted'}`} />
            {config.isConfigured ? 'Cloudinary configured and active' : 'Cloudinary not configured — using local-only mode'}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-1.5">
                Cloud Name
              </label>
              <input
                type="text"
                value={cloudName || config.cloudName}
                onChange={e => setCloudName(e.target.value)}
                placeholder="your-cloud-name"
                readOnly
                className="w-full h-10 px-3 rounded-md border border-hairline bg-canvas text-sm text-ink font-mono focus:outline-none cursor-not-allowed"
              />
              <p className="text-xs text-muted mt-1">Set via <code className="font-mono text-accent">VITE_CLOUDINARY_CLOUD_NAME</code> env variable</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-1.5">
                Upload Preset
              </label>
              <div className="relative">
                <input
                  type={showPreset ? 'text' : 'password'}
                  value={uploadPreset || config.uploadPreset}
                  onChange={e => setUploadPreset(e.target.value)}
                  placeholder="your-upload-preset"
                  readOnly
                  className="w-full h-10 px-3 pr-10 rounded-md border border-hairline bg-canvas text-sm text-ink font-mono focus:outline-none cursor-not-allowed"
                />
                <button
                  onClick={() => setShowPreset(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showPreset ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted mt-1">Set via <code className="font-mono text-accent">VITE_CLOUDINARY_UPLOAD_PRESET</code> env variable (must be unsigned)</p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-canvas border border-hairline text-xs text-muted space-y-1.5">
            <p className="font-medium text-body">How to configure:</p>
            <p>1. Create a <code className="font-mono">.env</code> file in the project root</p>
            <p>2. Add your Cloudinary credentials:</p>
            <pre className="mt-1 font-mono text-xs bg-surface-strong px-3 py-2 rounded overflow-x-auto">
{`VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset`}
            </pre>
            <p>3. Restart the development server</p>
            <p className="text-error/80">⚠ Never add CLOUDINARY_API_SECRET to frontend code</p>
          </div>
        </section>

        {/* Data storage */}
        <section className="bg-surface-card rounded-xl border border-hairline p-6">
          <h2 className="text-base font-semibold text-ink mb-1">Data Storage</h2>
          <p className="text-sm text-body mb-3">
            Gratis stores all projects and assets locally in your browser using IndexedDB.
            No data is sent to any server (except Cloudinary when configured).
          </p>
          <div className="space-y-2 text-sm text-body">
            <div className="flex items-center justify-between py-1.5 border-b border-hairline">
              <span>Project data</span>
              <span className="text-xs font-mono text-accent">IndexedDB (local)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-hairline">
              <span>Uploaded images</span>
              <span className="text-xs font-mono text-accent">Object URLs / Cloudinary</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span>Preferences</span>
              <span className="text-xs font-mono text-accent">IndexedDB (local)</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
