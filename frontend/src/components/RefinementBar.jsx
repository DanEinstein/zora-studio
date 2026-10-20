import { SlidersHorizontal } from 'lucide-react'

const REFINEMENTS = [
  { label: 'Punchier Hook', icon: '⚡' },
  { label: 'Make Concise', icon: '📉' },
  { label: 'Add Benchmark Stats', icon: '💻' },
  { label: 'Add Discussion Question', icon: '💬' },
]

export default function RefinementBar({ onRefine }) {
  return (
    <div className="bg-surface-container-low rounded-xl p-space-sm shadow-lg border border-outline-variant/30 flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-outline">
        <SlidersHorizontal className="w-[15px] h-[15px] text-secondary" strokeWidth={2} />
        <span>Instant Refinements:</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {REFINEMENTS.map(({ label, icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => onRefine?.(label)}
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm border border-outline-variant/30 transition-all flex items-center gap-1"
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>
    </div>
  )
}
