import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Sparkles, Upload } from 'lucide-react'

export function AssetsPage() {
  const navigate = useNavigate()
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
            <span className="text-sm font-semibold text-ink">Asset Library</span>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-normal text-ink tracking-tight mb-2">Asset Library</h1>
        <p className="text-body mb-8">Upload and manage your images. Assets are stored locally in your browser.</p>
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-hairline rounded-xl">
          <Upload className="w-10 h-10 text-muted mb-3" />
          <p className="text-sm font-medium text-ink mb-1">Upload images</p>
          <p className="text-xs text-muted">Drag and drop, or use the upload button in the editor sidebar</p>
        </div>
      </main>
    </div>
  )
}
