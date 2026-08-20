export interface FontOption {
  name: string
  family: string
  category: string
  weights: number[]
  googleFont: boolean
}

export const FONTS: FontOption[] = [
  // Sans-serif
  { name: 'Inter', family: 'Inter', category: 'Sans-serif', weights: [300, 400, 500, 600, 700], googleFont: true },
  { name: 'Roboto', family: 'Roboto', category: 'Sans-serif', weights: [300, 400, 500, 700], googleFont: true },
  { name: 'Open Sans', family: 'Open Sans', category: 'Sans-serif', weights: [300, 400, 600, 700], googleFont: true },
  { name: 'Lato', family: 'Lato', category: 'Sans-serif', weights: [300, 400, 700], googleFont: true },
  { name: 'Montserrat', family: 'Montserrat', category: 'Sans-serif', weights: [300, 400, 500, 600, 700, 800], googleFont: true },
  { name: 'Poppins', family: 'Poppins', category: 'Sans-serif', weights: [300, 400, 500, 600, 700], googleFont: true },
  { name: 'Nunito', family: 'Nunito', category: 'Sans-serif', weights: [300, 400, 600, 700], googleFont: true },
  { name: 'Source Sans 3', family: 'Source Sans 3', category: 'Sans-serif', weights: [300, 400, 600, 700], googleFont: true },
  { name: 'Noto Sans', family: 'Noto Sans', category: 'Sans-serif', weights: [400, 700], googleFont: true },
  { name: 'DM Sans', family: 'DM Sans', category: 'Sans-serif', weights: [300, 400, 500, 700], googleFont: true },

  // Serif
  { name: 'Playfair Display', family: 'Playfair Display', category: 'Serif', weights: [400, 500, 600, 700], googleFont: true },
  { name: 'Merriweather', family: 'Merriweather', category: 'Serif', weights: [300, 400, 700], googleFont: true },
  { name: 'Lora', family: 'Lora', category: 'Serif', weights: [400, 500, 600, 700], googleFont: true },
  { name: 'Georgia', family: 'Georgia', category: 'Serif', weights: [400, 700], googleFont: false },
  { name: 'EB Garamond', family: 'EB Garamond', category: 'Serif', weights: [400, 500, 600], googleFont: true },
  { name: 'Libre Baskerville', family: 'Libre Baskerville', category: 'Serif', weights: [400, 700], googleFont: true },

  // Display
  { name: 'Oswald', family: 'Oswald', category: 'Display', weights: [300, 400, 500, 600, 700], googleFont: true },
  { name: 'Bebas Neue', family: 'Bebas Neue', category: 'Display', weights: [400], googleFont: true },
  { name: 'Raleway', family: 'Raleway', category: 'Display', weights: [300, 400, 500, 600, 700, 800], googleFont: true },
  { name: 'Fjalla One', family: 'Fjalla One', category: 'Display', weights: [400], googleFont: true },
  { name: 'Anton', family: 'Anton', category: 'Display', weights: [400], googleFont: true },
  { name: 'Righteous', family: 'Righteous', category: 'Display', weights: [400], googleFont: true },

  // Handwriting
  { name: 'Dancing Script', family: 'Dancing Script', category: 'Handwriting', weights: [400, 500, 600, 700], googleFont: true },
  { name: 'Pacifico', family: 'Pacifico', category: 'Handwriting', weights: [400], googleFont: true },
  { name: 'Great Vibes', family: 'Great Vibes', category: 'Handwriting', weights: [400], googleFont: true },
  { name: 'Caveat', family: 'Caveat', category: 'Handwriting', weights: [400, 500, 600, 700], googleFont: true },

  // Monospace
  { name: 'JetBrains Mono', family: 'JetBrains Mono', category: 'Monospace', weights: [400, 500], googleFont: true },
  { name: 'Source Code Pro', family: 'Source Code Pro', category: 'Monospace', weights: [400, 500, 700], googleFont: true },
  { name: 'Fira Code', family: 'Fira Code', category: 'Monospace', weights: [400, 500], googleFont: true },
]

export const FONT_CATEGORIES = ['All', 'Sans-serif', 'Serif', 'Display', 'Handwriting', 'Monospace']

export const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 112, 128]

// Load a Google font dynamically
const loadedFonts = new Set<string>()

export function loadGoogleFont(fontFamily: string, weights: number[] = [400, 700]): void {
  const key = `${fontFamily}-${weights.join(',')}`
  if (loadedFonts.has(key)) return
  loadedFonts.add(key)

  const sanitized = fontFamily.replace(/\s+/g, '+')
  const weightStr = weights.join(';')
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${sanitized}:wght@${weightStr}&display=swap`
  document.head.appendChild(link)
}
