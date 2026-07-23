'use client'

import { Type, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReadingControlsProps {
  fontSize: number
  onFontSizeChange: (size: number) => void
  fontFamily: 'serif' | 'sans'
  onFontFamilyChange: (family: 'serif' | 'sans') => void
  distractionFree: boolean
  onDistractionFreeChange: (value: boolean) => void
  dark?: boolean
}

export function ReadingControls({
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  distractionFree,
  onDistractionFreeChange,
}: ReadingControlsProps) {
  const fg = 'text-slate-300/70 hover:bg-white/10'

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onFontSizeChange(Math.max(14, fontSize - 2))}
        className={cn('rounded-lg p-1.5 transition-colors', fg)}
        title="Decrease font size"
      >
        <Type size={14} />
      </button>
      <span className="min-w-[2ch] text-center font-mono text-[11px] text-slate-300/70">{fontSize}</span>
      <button
        onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))}
        className={cn('rounded-lg p-1.5 transition-colors', fg)}
        title="Increase font size"
      >
        <Type size={18} />
      </button>

      <div className="h-4 w-px mx-2 bg-slate-600/30" />

      <button
        onClick={() => onFontFamilyChange(fontFamily === 'serif' ? 'sans' : 'serif')}
        className={cn(
          'rounded-lg px-2 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors',
          fontFamily === 'serif'
            ? 'bg-cyan-400/20 text-cyan-300'
            : fg
        )}
      >
        {fontFamily === 'serif' ? 'Serif' : 'Sans'}
      </button>

      <div className="h-4 w-px mx-2 bg-slate-600/30" />

      <button
        onClick={() => onDistractionFreeChange(!distractionFree)}
        className={cn(
          'rounded-lg p-1.5 transition-colors',
          distractionFree ? 'text-cyan-300' : fg
        )}
        title={distractionFree ? 'Exit focus mode' : 'Focus mode'}
      >
        {distractionFree ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
    </div>
  )
}
