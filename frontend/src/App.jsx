import { useCallback, useMemo, useState } from 'react'
import { FileText, Moon } from 'lucide-react'
import InputStudio from './components/InputStudio'
import PreviewPanel from './components/PreviewPanel'
import { useGenerateContent } from './hooks/useGenerateContent'

const STREAM_LABELS = {
  linkedin: 'LINKEDIN_SYNTHESIS_V2',
  medium: 'MEDIUM_ESSAY_V1',
  substack: 'SUBSTACK_DIGEST_V1',
}

export default function App() {
  const {
    content,
    isStreaming,
    error,
    versions,
    activeVersionIndex,
    setActiveVersionIndex,
    generate,
    refine,
    regenerate,
  } = useGenerateContent()

  const [mode, setMode] = useState('social') // social | article
  const [platform, setPlatform] = useState('linkedin')
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState([])
  const [tone, setTone] = useState('technical')

  const streamName = STREAM_LABELS[platform] || STREAM_LABELS.linkedin

  const previewVersions = useMemo(
    () => versions.map((v, i) => ({ id: String(i), label: v.label })),
    [versions],
  )

  const activeVersionId =
    activeVersionIndex >= 0 ? String(activeVersionIndex) : ''

  const handleModeChange = (nextMode) => {
    setMode(nextMode)
    // Social Post ↔ Article toggles default platform LinkedIn ↔ Medium only
    if (nextMode === 'social') {
      setPlatform('linkedin')
    } else {
      setPlatform('medium')
    }
  }

  const buildPayload = useCallback(
    () => ({
      platform,
      topic,
      context: description,
      tone,
      include_hashtags: tags.length > 0,
      include_code: notes.trim().length > 0,
      tags,
      code_notes: notes,
      refinement: null,
    }),
    [platform, topic, description, tone, tags, notes],
  )

  const handleGenerate = useCallback(async () => {
    await generate(buildPayload())
  }, [generate, buildPayload])

  const handleRegenerate = useCallback(async () => {
    await regenerate()
  }, [regenerate])

  const handleRefine = useCallback(
    (chipLabel) => {
      refine(chipLabel)
    },
    [refine],
  )

  const handleVersionChange = useCallback(
    (id) => {
      const index = Number(id)
      if (!Number.isNaN(index)) {
        setActiveVersionIndex(index)
      }
    },
    [setActiveVersionIndex],
  )

  const busy = isStreaming

  const telemetryPlatform = useMemo(
    () => platform.toUpperCase(),
    [platform],
  )

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Fixed header */}
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30">
        <div className="h-16 w-full px-6 flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm shrink-0">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
              Zora
            </span>
            <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-label-sm text-label-sm tracking-wider uppercase">
              STUDIO
            </span>
          </div>

          <nav className="flex items-center p-1 bg-surface-container-lowest rounded-full">
            <button
              type="button"
              onClick={() => handleModeChange('social')}
              className={
                mode === 'social'
                  ? 'px-space-md py-1.5 transition-all bg-primary-container text-on-primary-container rounded-full font-label-md text-label-md'
                  : 'px-space-md py-1.5 rounded-full text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high hover:text-on-surface transition-all'
              }
            >
              Social Post
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('article')}
              className={
                mode === 'article'
                  ? 'px-space-md py-1.5 transition-all bg-primary-container text-on-primary-container rounded-full font-label-md text-label-md'
                  : 'px-space-md py-1.5 rounded-full text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high hover:text-on-surface transition-all'
              }
            >
              Article / Essay
            </button>
          </nav>

          <div className="flex items-center gap-space-md shrink-0">
            <button
              type="button"
              className="flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all border border-outline-variant/30"
            >
              <FileText className="w-3.5 h-3.5 text-secondary" strokeWidth={2} />
              <span className="font-label-md text-label-md">
                {versions.length} Drafts
              </span>
            </button>
            <button
              type="button"
              className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all flex items-center justify-center"
              aria-label="Theme"
            >
              <Moon className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
            <div
              className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant bg-gradient-to-br from-primary-container to-tertiary"
              aria-hidden
            />
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-background flex-1 flex flex-col">
        {/* Telemetry strip */}
        <div className="w-full bg-surface-container-lowest px-6 py-2 flex flex-wrap items-center justify-between gap-space-sm border-b border-outline-variant/20">
          <div className="flex items-center gap-space-md flex-wrap">
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
              <span
                className={`w-2 h-2 rounded-full bg-secondary ${isStreaming ? 'animate-pulse' : 'opacity-40'}`}
              />
              {isStreaming ? `STREAM ACTIVE: ${streamName}` : 'IDLE'}
            </div>
            <span className="font-label-sm text-label-sm text-outline">|</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full bg-tertiary ${isStreaming ? '' : 'opacity-40'}`}
              />
              {isStreaming ? 'BUFFERING' : 'READY'}
            </span>
          </div>
          <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-outline">
            <span className="text-on-surface-variant">
              {telemetryPlatform}
            </span>
            <span className="px-space-xs py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm font-medium">
              {isStreaming ? 'GENERATING…' : 'READY'}
            </span>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="mx-6 mt-3 px-4 py-2 rounded-lg bg-error-container text-on-error-container font-label-sm text-label-sm border border-error/30"
          >
            {error}
          </div>
        ) : null}

        {/* Dual workspace grid */}
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6 items-start w-full">
          <InputStudio
            platform={platform}
            onPlatformChange={setPlatform}
            topic={topic}
            onTopicChange={setTopic}
            description={description}
            onDescriptionChange={setDescription}
            notes={notes}
            onNotesChange={setNotes}
            tags={tags}
            onTagsChange={setTags}
            tone={tone}
            onToneChange={setTone}
            onGenerate={handleGenerate}
            isGenerating={busy}
          />
          <PreviewPanel
            platform={platform}
            content={content}
            versions={previewVersions}
            activeVersionId={activeVersionId}
            onVersionChange={handleVersionChange}
            onRegenerate={handleRegenerate}
            onRefine={handleRefine}
            isGenerating={busy}
          />
        </div>
      </main>
    </div>
  )
}
