import { useEffect, useMemo, useState } from 'react'
import {
  Code2,
  GraphHub,
  Sparkles,
  Tag,
  Terminal,
  X,
} from 'lucide-react'
import PlatformTabs from './PlatformTabs'

const TONES = [
  { id: 'technical', label: 'Technical & Deep-Dive' },
  { id: 'storytelling', label: 'Storytelling' },
  { id: 'eli5', label: 'ELI5' },
  { id: 'casual', label: 'Casual Summary' },
]

const COMBINED_MAX = 4000

function isMacPlatform() {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)
}

export default function InputStudio({
  platform,
  onPlatformChange,
  topic,
  onTopicChange,
  description,
  onDescriptionChange,
  notes,
  onNotesChange,
  tags,
  onTagsChange,
  tone,
  onToneChange,
  onGenerate,
  isGenerating = false,
}) {
  const [tagDraft, setTagDraft] = useState('')
  const modHint = useMemo(() => (isMacPlatform() ? '⌘' : 'Ctrl'), [])

  const combinedLength = topic.length + description.length + notes.length
  const notesLines = notes ? notes.split('\n').length : 0
  const noteWords = notes.trim().split(/\s+/).filter(Boolean).length
  const approxTokens = noteWords ? Math.round(noteWords * 1.3) : 0

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        onGenerate?.()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onGenerate])

  const commitTag = () => {
    const value = tagDraft.trim()
    if (!value) return
    const normalized = value.startsWith('#') || value.startsWith('@') ? value : `#${value}`
    if (!tags.includes(normalized)) {
      onTagsChange([...tags, normalized])
    }
    setTagDraft('')
  }

  const removeTag = (tag) => {
    onTagsChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
      {/* 1. TARGET DISTRIBUTION RAIL */}
      <div className="bg-surface-container-low rounded-xl p-space-md shadow-xl relative overflow-hidden border border-outline-variant/30">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-space-xs">
            <GraphHub className="text-primary w-5 h-5" strokeWidth={2} />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              1. Target Distribution Rail
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-outline">SELECT ENGINE</span>
        </div>
        <PlatformTabs platform={platform} onChange={onPlatformChange} />
      </div>

      {/* 2. CONCEPT & EVENT DESCRIPTION */}
      <div className="bg-surface-container-low rounded-xl p-space-md shadow-xl flex flex-col gap-space-md border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <Terminal className="text-secondary w-5 h-5" strokeWidth={2} />
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              2. Concept &amp; Event Description
            </label>
          </div>
          <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1">
            <Code2 className="w-[13px] h-[13px]" strokeWidth={2} />
            MD + RUST
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-outline">Topic or Concept Title</span>
          <input
            type="text"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="e.g. Raft Consensus Implementation Notes"
            className="w-full bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm px-space-md py-space-sm rounded-lg focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary shadow-inner placeholder:text-outline border border-outline-variant/40"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-outline">Deep Event / Study Description</span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe the event, breakthrough, or study milestone..."
            className="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-space-md py-space-sm rounded-lg focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary shadow-inner placeholder:text-outline border border-outline-variant/40 resize-none leading-relaxed"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
            <span>Raw Notes &amp; Code Snippets</span>
            <span className="text-on-surface-variant">
              {approxTokens} tokens / {notesLines} lines · {combinedLength}/{COMBINED_MAX}
            </span>
          </div>
          <div className="relative rounded-lg bg-surface-container-lowest p-space-xs overflow-hidden focus-within:ring-1 focus-within:ring-primary shadow-inner border border-outline-variant/40">
            <div className="flex gap-2">
              <div className="select-none py-1.5 px-1 text-right font-label-sm text-label-sm text-outline-variant flex flex-col gap-1">
                {Array.from({ length: Math.max(5, Math.min(notesLines, 12)) }, (_, i) => (
                  <span key={i}>{String(i + 1).padStart(2, '0')}</span>
                ))}
              </div>
              <textarea
                rows={5}
                spellCheck={false}
                value={notes}
                maxLength={COMBINED_MAX}
                onChange={(e) => onNotesChange(e.target.value)}
                className="w-full bg-transparent text-on-surface font-code-md text-code-md p-1.5 focus:outline-none resize-none leading-relaxed placeholder:text-outline selection:bg-primary-container selection:text-on-primary-container"
                placeholder="Paste raw notes, bullets, or code…"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. HASHTAGS, MENTIONS & AUDIENCE */}
      <div className="bg-surface-container-low rounded-xl p-space-md shadow-xl flex flex-col gap-space-md border border-outline-variant/30">
        <div className="flex items-center gap-space-xs">
          <Tag className="text-primary w-5 h-5" strokeWidth={2} />
          <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
            3. Hashtags, Mentions &amp; Audience
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm text-outline">Hashtags &amp; Mentions</span>
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 min-h-[44px]">
            {tags.map((tag) => {
              const isMention = tag.startsWith('@')
              return (
                <span
                  key={tag}
                  className={
                    isMention
                      ? 'inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-high text-secondary font-label-sm text-label-sm border border-secondary/20'
                      : 'inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-high text-primary font-label-sm text-label-sm border border-primary/20'
                  }
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-error transition-colors flex items-center"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                </span>
              )
            })}
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  commitTag()
                } else if (e.key === 'Backspace' && !tagDraft && tags.length) {
                  removeTag(tags[tags.length - 1])
                }
              }}
              onBlur={commitTag}
              className="bg-transparent text-on-surface text-body-sm placeholder:text-outline outline-none px-1.5 py-0.5 flex-1 min-w-[140px]"
              placeholder="Add #tag or @mention..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm text-outline">Tone &amp; Framing</span>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => {
              const active = tone === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onToneChange(t.id)}
                  className={
                    active
                      ? 'px-3 py-1.5 rounded-full text-label-sm font-label-sm bg-primary/20 text-primary border border-primary/40 font-semibold shadow-sm'
                      : 'px-3 py-1.5 rounded-full text-label-sm font-label-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30 transition-colors'
                  }
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Generate CTA */}
      <button
        type="button"
        disabled={isGenerating}
        onClick={() => onGenerate?.()}
        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary-container via-[#8657f6] to-secondary p-[1px] shadow-lg shadow-primary-container/20 hover:shadow-primary-container/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
      >
        <div className="flex items-center justify-between w-full bg-gradient-to-r from-surface-container-lowest/90 via-surface-container-low/90 to-surface-container-lowest/90 px-6 py-4 rounded-[11px] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Sparkles className="text-secondary w-7 h-7 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2} />
            <div className="text-left">
              <span className="text-on-surface font-headline-sm text-headline-sm font-bold block leading-none">
                Generate Post / Article ✨
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm mt-1 block">
                Synthesize telemetry into target format
              </span>
            </div>
          </div>
          <kbd className="px-2.5 py-1 rounded bg-surface-container-high text-outline text-label-sm font-label-sm border border-outline-variant/40 shadow-inner">
            {modHint} + Enter
          </kbd>
        </div>
      </button>
    </div>
  )
}
