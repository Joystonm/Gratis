import type { CanvasPreset } from '@/types'

export const CANVAS_PRESETS: CanvasPreset[] = [
  // Social Media
  { id: 'instagram-post', name: 'Instagram Post', category: 'Social Media', width: 1080, height: 1080, unit: 'px', description: '1:1 square' },
  { id: 'instagram-story', name: 'Instagram Story', category: 'Social Media', width: 1080, height: 1920, unit: 'px', description: '9:16 vertical' },
  { id: 'instagram-landscape', name: 'Instagram Landscape', category: 'Social Media', width: 1080, height: 566, unit: 'px', description: '1.91:1' },
  { id: 'facebook-post', name: 'Facebook Post', category: 'Social Media', width: 1200, height: 630, unit: 'px', description: '1.91:1' },
  { id: 'facebook-story', name: 'Facebook Story', category: 'Social Media', width: 1080, height: 1920, unit: 'px', description: '9:16 vertical' },
  { id: 'x-post', name: 'X (Twitter) Post', category: 'Social Media', width: 1200, height: 675, unit: 'px', description: '16:9' },
  { id: 'linkedin-post', name: 'LinkedIn Post', category: 'Social Media', width: 1200, height: 627, unit: 'px', description: '1.91:1' },
  { id: 'linkedin-banner', name: 'LinkedIn Banner', category: 'Social Media', width: 1584, height: 396, unit: 'px', description: '4:1' },
  { id: 'pinterest-pin', name: 'Pinterest Pin', category: 'Social Media', width: 1000, height: 1500, unit: 'px', description: '2:3 vertical' },
  { id: 'tiktok', name: 'TikTok Cover', category: 'Social Media', width: 1080, height: 1920, unit: 'px', description: '9:16 vertical' },

  // YouTube
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', category: 'YouTube', width: 1280, height: 720, unit: 'px', description: '16:9' },
  { id: 'youtube-banner', name: 'YouTube Channel Art', category: 'YouTube', width: 2560, height: 1440, unit: 'px', description: '16:9 banner' },
  { id: 'youtube-shorts', name: 'YouTube Shorts', category: 'YouTube', width: 1080, height: 1920, unit: 'px', description: '9:16' },

  // Print / Marketing
  { id: 'poster-a4', name: 'Poster (A4)', category: 'Print', width: 794, height: 1123, unit: 'px', description: 'A4 portrait' },
  { id: 'poster-a3', name: 'Poster (A3)', category: 'Print', width: 1123, height: 1587, unit: 'px', description: 'A3 portrait' },
  { id: 'flyer', name: 'Flyer', category: 'Print', width: 794, height: 1123, unit: 'px', description: 'A4 format' },
  { id: 'business-card', name: 'Business Card', category: 'Print', width: 1050, height: 600, unit: 'px', description: 'Standard 3.5×2"' },

  // Presentations
  { id: 'presentation-16-9', name: 'Presentation', category: 'Presentation', width: 1920, height: 1080, unit: 'px', description: '16:9 widescreen' },
  { id: 'presentation-4-3', name: 'Presentation (4:3)', category: 'Presentation', width: 1600, height: 1200, unit: 'px', description: '4:3 classic' },

  // Web / Digital
  { id: 'website-banner', name: 'Website Banner', category: 'Web', width: 1920, height: 600, unit: 'px', description: 'Full-width hero' },
  { id: 'email-header', name: 'Email Header', category: 'Web', width: 600, height: 200, unit: 'px', description: 'Email newsletter' },
  { id: 'product-ad', name: 'Product Advertisement', category: 'Web', width: 800, height: 800, unit: 'px', description: '1:1 square' },
  { id: 'display-ad-leaderboard', name: 'Leaderboard Ad', category: 'Web', width: 728, height: 90, unit: 'px', description: '728×90' },

  // Custom
  { id: 'custom', name: 'Custom Size', category: 'Custom', width: 800, height: 600, unit: 'px', description: 'Set your own' },
]

export const PRESET_CATEGORIES = [
  'All',
  'Social Media',
  'YouTube',
  'Print',
  'Presentation',
  'Web',
  'Custom',
]

export function getPresetsByCategory(category: string): CanvasPreset[] {
  if (category === 'All') return CANVAS_PRESETS
  return CANVAS_PRESETS.filter(p => p.category === category)
}

export function getPresetById(id: string): CanvasPreset | undefined {
  return CANVAS_PRESETS.find(p => p.id === id)
}
