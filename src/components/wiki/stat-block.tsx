import type { CharacterStats } from '@/lib/types'

interface StatBlockProps {
  stats: CharacterStats
}

const statLabels: { key: keyof CharacterStats; label: string }[] = [
  { key: 'strength', label: 'STR' },
  { key: 'agility', label: 'AGI' },
  { key: 'intelligence', label: 'INT' },
  { key: 'charisma', label: 'CHA' },
  { key: 'wisdom', label: 'WIS' },
  { key: 'vitality', label: 'VIT' },
]

export function StatBlock({ stats }: StatBlockProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {statLabels.map(({ key, label }) => (
        <div key={key} className="glass-panel-light flex flex-col items-center rounded-xl p-3">
          <span className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            {label}
          </span>
          <div className="mt-1.5 flex items-center gap-1">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-moonstone-blue to-ethereal-teal transition-all duration-500"
                style={{ width: `${(stats[key] / 20) * 100}%` }}
              />
            </div>
            <span className="min-w-[2ch] text-right text-sm font-bold text-on-surface">
              {stats[key]}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
