import { Bookmark } from 'lucide-react'

const PLATFORMS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    hint: '3,000 max',
    icon: (
      <span className="w-6 h-6 rounded flex items-center justify-center bg-primary text-on-primary font-label-md font-bold text-label-md shadow-sm">
        in
      </span>
    ),
  },
  {
    id: 'medium',
    label: 'Medium',
    hint: 'Long-form',
    icon: (
      <span className="w-6 h-6 rounded flex items-center justify-center bg-surface-container-highest text-on-surface font-label-md font-bold text-label-md">
        M
      </span>
    ),
  },
  {
    id: 'substack',
    label: 'Substack',
    hint: 'Newsletter',
    icon: (
      <span className="w-6 h-6 rounded flex items-center justify-center bg-surface-container-highest text-on-surface font-label-md font-bold text-label-md">
        <Bookmark className="w-[15px] h-[15px]" strokeWidth={2} />
      </span>
    ),
  },
]

export default function PlatformTabs({ platform, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-space-xs" role="tablist">
      {PLATFORMS.map((p) => {
        const active = platform === p.id
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(p.id)}
            className={
              active
                ? 'platform-tab relative group flex flex-col items-start p-space-sm rounded-lg bg-surface-container-high transition-all text-left shadow-[0_0_20px_rgba(160,120,255,0.18)] border border-primary/40'
                : 'platform-tab relative group flex flex-col items-start p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-all text-left border border-outline-variant/20'
            }
          >
            <div className="w-full flex items-center justify-between mb-1.5">
              {p.icon}
              <span
                className={
                  active
                    ? 'w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]'
                    : 'w-2 h-2 rounded-full bg-outline-variant'
                }
              />
            </div>
            <span
              className={
                active
                  ? 'font-headline-sm text-headline-sm text-on-surface block font-semibold leading-tight'
                  : 'font-headline-sm text-headline-sm text-on-surface-variant group-hover:text-on-surface block font-semibold leading-tight'
              }
            >
              {p.label}
            </span>
            <span
              className={
                active
                  ? 'font-label-sm text-label-sm text-secondary-fixed-dim mt-0.5'
                  : 'font-label-sm text-label-sm text-outline mt-0.5'
              }
            >
              {p.hint}
            </span>
            <div
              className={
                active
                  ? 'w-full h-0.5 rounded-full bg-gradient-to-r from-primary to-secondary mt-2'
                  : 'w-full h-0.5 rounded-full bg-transparent mt-2'
              }
            />
          </button>
        )
      })}
    </div>
  )
}
