import { BrowserRouter, Routes, Route } from 'react-router-dom'
import * as Tooltip from '@radix-ui/react-tooltip'
import { ToastContainer } from '@/components/ui/Toast'
import { LandingPage } from '@/pages/LandingPage'
import { CreateDesignPage } from '@/pages/CreateDesignPage'
import { EditorPage } from '@/pages/EditorPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { TemplatesPage } from '@/pages/TemplatesPage'
import { AssetsPage } from '@/pages/AssetsPage'
import { SettingsPage } from '@/pages/SettingsPage'

export default function App() {
  return (
    <Tooltip.Provider delayDuration={600}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreateDesignPage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </Tooltip.Provider>
  )
}
