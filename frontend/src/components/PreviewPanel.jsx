import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  AtSign,
  Clock,
  Copy,
  Download,
  FileText,
  Globe,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react'
import RefinementBar from './RefinementBar'

const PLATFORM_META = {
  linkedin: { badge: 'LinkedIn Post', charLimit: 3000 },
  medium: { badge: 'Medium Article', charLimit: 12000 },
  substack: { badge: 'Substack Newsletter', charLimit: 8000 },
}

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function countEntities(text) {
  const mentions = (text.match(/@[A-Za-z0-9_]+/g) || []).length
  const tags = (text.match(/#[A-Za-z0-9_]+/g) || []).length
  return { mentions, tags }
}

function readTimeMinutes(words) {
  if (words <= 0) return 0
  return Math.max(0.5, Math.round((words / 200) * 10) / 10)
}

export default function PreviewPanel({
  platform = 'linkedin',
  content = '',
  versions = [],
  activeVersionId = '',
  onVersionChange,
  onRegenerate,
  onRefine,
  isGenerating = false,
}) {
  const [copied, setCopied] = useState(false)
  const meta = PLATFORM_META[platform] || PLATFORM_META.linkedin

  const metrics = useMemo(() => {
    const chars = content.length
    const words = countWords(content)
    const { mentions, tags } = countEntities(content)
    return {
      chars,
      words,
      readTime: readTimeMinutes(words),
      mentions,
      tags,
      charPct: Math.min(100, (chars / meta.charLimit) * 100),
    }
  }, [content, meta.charLimit])

  const versionLabel = (v) => {
    if (v.label === 'Active Staged' || v.id === '0') {
      const name = platform.charAt(0).toUpperCase() + platform.slice(1)
      return `Active Staged (${name})`
    }
    return v.label
  }

  const handleCopy = async () => {
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard may be unavailable */
    }
  }

  const handleExport = () => {
    const blob = new Blob([content || ''], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zora-${platform}-draft.md`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
      {/* Vault header */}
      <div className="bg-surface-container-low rounded-xl p-space-md shadow-xl border border-outline-variant/30 flex flex-col gap-space-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_#4edea3]" />
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              GENERATED POST STAGING VAULT
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-label-sm font-label-sm border border-secondary/30 ml-1">
              {meta.badge}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRegenerate?.()}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm border border-outline-variant/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-[15px] h-[15px] text-primary ${isGenerating ? 'animate-spin' : ''}`} strokeWidth={2} />
              Regenerate ✨
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm border border-outline-variant/30 transition-all"
            >
              <Download className="w-[15px] h-[15px] text-outline" strokeWidth={2} />
              Export Markdown
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary-fixed transition-all"
            >
              <Copy className="w-4 h-4" strokeWidth={2} />
              {copied ? 'Copied!' : '📋 Copy to Clipboard'}
            </button>
          </div>
        </div>

        {/* Version tabs — empty until generate produces versions */}
        {versions.length > 0 ? (
          <div className="flex items-center gap-1 border-b border-outline-variant/20 pt-2 overflow-x-auto">
            {versions.map((v) => {
              const active = activeVersionId === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onVersionChange?.(v.id)}
                  className={
                    active
                      ? 'px-3.5 py-1.5 font-label-sm text-label-sm border-b-2 border-primary text-primary font-semibold flex items-center gap-1.5 whitespace-nowrap'
                      : 'px-3.5 py-1.5 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1.5 whitespace-nowrap'
                  }
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  {versionLabel(v)}
                </button>
              )
            })}
          </div>
        ) : null}

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-label-sm font-label-sm">
              <span className="text-outline">Characters</span>
              <span className="text-primary font-bold">
                {metrics.chars.toLocaleString()}{' '}
                <span className="text-outline font-normal">
                  / {meta.charLimit >= 1000 ? `${Math.round(meta.charLimit / 1000)}k` : meta.charLimit}
                </span>
              </span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${metrics.charPct}%` }}
              />
            </div>
          </div>
          <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 flex items-center justify-between">
            <div>
              <span className="text-outline text-label-sm font-label-sm block">Words</span>
              <span className="text-on-surface font-headline-sm font-semibold text-headline-sm">
                {metrics.words}
              </span>
            </div>
            <FileText className="w-5 h-5 text-outline-variant" strokeWidth={1.5} />
          </div>
          <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 flex items-center justify-between">
            <div>
              <span className="text-outline text-label-sm font-label-sm block">Read Time</span>
              <span className="text-secondary font-headline-sm font-semibold text-headline-sm">
                {metrics.readTime} min
              </span>
            </div>
            <Clock className="w-5 h-5 text-outline-variant" strokeWidth={1.5} />
          </div>
          <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 flex items-center justify-between">
            <div>
              <span className="text-outline text-label-sm font-label-sm block">Entities</span>
              <span className="text-tertiary font-headline-sm font-semibold text-headline-sm">
                {metrics.mentions} mentions, {metrics.tags} tags
              </span>
            </div>
            <AtSign className="w-5 h-5 text-outline-variant" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Preview canvas */}
      <div className="bg-surface-container-low rounded-xl p-space-md shadow-xl border border-outline-variant/30 flex flex-col gap-4 min-h-[320px]">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-secondary ring-2 ring-primary/30 flex items-center justify-center text-on-primary font-headline-sm font-bold">
              You
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Your Name
                </span>
              </div>
              <p className="text-on-surface-variant text-label-sm font-label-sm">
                Preview author
              </p>
              <div className="flex items-center gap-1 text-outline text-label-sm font-label-sm mt-0.5">
                <span>Draft</span>
                <span>•</span>
                <Globe className="w-[13px] h-[13px]" strokeWidth={2} />
              </div>
            </div>
          </div>
          <button type="button" className="p-1 rounded-full text-outline hover:text-on-surface transition-colors">
            <MoreHorizontal className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {content ? (
          <div className="prose-zora selection:bg-primary-container selection:text-on-primary-container">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-outline font-label-sm text-label-sm py-16">
            Generate a post to populate the staging vault.
          </div>
        )}
      </div>

      <RefinementBar onRefine={onRefine} />
    </div>
  )
}
