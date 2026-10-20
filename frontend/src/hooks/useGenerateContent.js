import { useCallback, useRef, useState } from 'react'

/**
 * Streams POST /api/v1/generate SSE into content state.
 * Keeps in-memory version history for version tabs.
 */
export function useGenerateContent() {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [versions, setVersions] = useState([])
  const [activeVersionIndex, setActiveVersionIndexState] = useState(-1)

  const abortRef = useRef(null)
  const lastPayloadRef = useRef(null)
  const contentRef = useRef('')
  const versionsRef = useRef([])

  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  const setActiveVersionIndex = useCallback((index) => {
    setActiveVersionIndexState(index)
    const entry = versionsRef.current[index]
    if (entry) {
      contentRef.current = entry.content
      setContent(entry.content)
    }
  }, [])

  const pushVersion = useCallback((label, text) => {
    const entry = { label, content: text }
    const next = [...versionsRef.current, entry]
    versionsRef.current = next
    setVersions(next)
    setActiveVersionIndexState(next.length - 1)
  }, [])

  const generate = useCallback(
    async (payload) => {
      abort()

      const controller = new AbortController()
      abortRef.current = controller
      lastPayloadRef.current = { ...payload }

      setError(null)
      setContent('')
      contentRef.current = ''
      setIsStreaming(true)

      let accumulated = ''

      try {
        const res = await fetch('/api/v1/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        if (!res.ok) {
          const message = `Generate failed (${res.status})`
          setError(message)
          return
        }

        if (!res.body) {
          setError('No response body from generate endpoint')
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let finished = false

        while (!finished) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trimEnd()
            if (!trimmed.startsWith('data: ')) continue

            const raw = trimmed.slice(6).trim()
            if (!raw || raw === '[DONE]') continue

            let parsed
            try {
              parsed = JSON.parse(raw)
            } catch {
              continue
            }

            if (parsed.error) {
              setError(String(parsed.error))
              finished = true
              break
            }

            if (parsed.done) {
              const label = payload.refinement
                ? `Refined: ${payload.refinement}`
                : versionsRef.current.length === 0
                  ? 'Active Staged'
                  : `Version ${versionsRef.current.length + 1}`
              pushVersion(label, accumulated)
              finished = true
              break
            }

            if (parsed.token != null) {
              accumulated += String(parsed.token)
              contentRef.current = accumulated
              setContent(accumulated)
            }
          }
        }

        // Stream closed without explicit done — still keep successful output
        if (!finished && accumulated && !controller.signal.aborted) {
          const label = payload.refinement
            ? `Refined: ${payload.refinement}`
            : versionsRef.current.length === 0
              ? 'Active Staged'
              : `Version ${versionsRef.current.length + 1}`
          pushVersion(label, accumulated)
        }
      } catch (err) {
        if (err?.name === 'AbortError') {
          return
        }
        setError(err?.message || 'Generation failed')
      } finally {
        setIsStreaming(false)
        if (abortRef.current === controller) {
          abortRef.current = null
        }
      }
    },
    [abort, pushVersion],
  )

  const refine = useCallback(
    async (chipLabel) => {
      const prev = lastPayloadRef.current
      if (!prev) {
        setError('Generate content before refining')
        return
      }
      const previousContent = contentRef.current
      const baseContext = prev.context || ''
      const context = previousContent
        ? [baseContext, '--- Previous draft ---', previousContent]
            .filter(Boolean)
            .join('\n\n')
        : baseContext

      await generate({
        ...prev,
        context,
        refinement: chipLabel,
      })
    },
    [generate],
  )

  const regenerate = useCallback(async () => {
    const prev = lastPayloadRef.current
    if (!prev) {
      setError('Generate content before regenerating')
      return
    }
    await generate({
      ...prev,
      refinement: null,
    })
  }, [generate])

  return {
    content,
    isStreaming,
    error,
    versions,
    activeVersionIndex,
    setActiveVersionIndex,
    generate,
    refine,
    regenerate,
    abort,
  }
}

export default useGenerateContent
