# Zora

Zora is a local developer studio that turns raw technical notes into ready-to-publish posts for **LinkedIn**, **Medium**, and **Substack**.

- **Frontend:** React SPA (Vite) on port `5173`
- **Backend:** FastAPI on port `8000`
- **Model:** local Ollama (`gemma3:1b`) — no cloud inference or telemetry

```
posts_toolset/
├── backend/          # FastAPI app (app.main:app)
│   ├── app/
│   └── requirements.txt
├── frontend/         # Vite + React studio UI
├── stitch/           # Design reference (Stitch export)
├── .env.example      # Optional Ollama URL / model overrides
└── README.md
```

## Prerequisites

| Tool | Version |
| --- | --- |
| Node.js | 18+ |
| Python | 3.10+ |
| [Ollama](https://ollama.com) | installed and running |

Pull the generation model once:

```bash
ollama pull gemma3:1b
```

Confirm it appears in `ollama list`.

## Clone / setup

```bash
git clone <your-repo-url> posts_toolset
cd posts_toolset
```

Copy optional env defaults if you want to override Ollama settings:

```bash
cp .env.example backend/.env   # optional; defaults already match local Ollama
```

Or export in the shell before starting the backend:

```bash
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=gemma3:1b
```

## Backend (port 8000)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API base: [http://127.0.0.1:8000](http://127.0.0.1:8000)

Quick health check:

```bash
curl http://127.0.0.1:8000/api/v1/health
```

## Frontend (port 5173)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Vite proxies `/api` → `http://localhost:8000`, so the browser can call `/api/v1/...` without CORS issues during local development.

## Using the studio

1. Choose **Social Post** (LinkedIn) or **Article / Essay** (Medium / Substack).
2. Fill **topic**, optional description, code notes, tags, and tone.
3. Click generate (or `Ctrl`/`⌘` + `Enter`).
4. Watch the preview stream tokens from Ollama.
5. Use refine chips or regenerate; drafts stay in-memory as versions until you refresh.

## API overview

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Liveness + Ollama / model readiness |
| `POST` | `/api/v1/generate` | SSE stream of generated tokens |

### Health

```bash
curl http://127.0.0.1:8000/api/v1/health
```

Example response:

```json
{
  "ok": true,
  "ollama": true,
  "model": "gemma3:1b",
  "model_ready": true
}
```

### Generate (SSE)

```bash
curl -N -X POST http://127.0.0.1:8000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "linkedin",
    "topic": "P2P networking basics",
    "context": "Notes from today’s reading",
    "code_notes": "",
    "tags": ["networking"]
  }'
```

Events are `text/event-stream` lines like `data: {"token": "..."}` and a final `data: {"done": true}`. Errors appear as `data: {"error": "..."}`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Health shows `"ollama": false` | Start Ollama (`ollama serve` or the desktop app), then retry `/api/v1/health`. |
| `"model_ready": false` | Run `ollama pull gemma3:1b` and confirm with `ollama list`. |
| Generate SSE `error` | Ollama must be up and `gemma3:1b` available; check backend terminal logs. |
| Frontend can’t reach API | Backend must be on `:8000` and you must use `npm run dev` (Vite `/api` proxy). Calling the UI without the backend, or hitting the wrong port, will fail. |
| CORS when calling API from another origin | Prefer the Vite proxy. Backend CORS allows localhost / `127.0.0.1` only. Direct browser calls from other hosts need a proxy or CORS change. |
| Custom Ollama host/port | Set `OLLAMA_BASE_URL` (see `.env.example`) before starting uvicorn. |

## Optional config

See [`.env.example`](.env.example). Variables:

- `OLLAMA_BASE_URL` — default `http://localhost:11434`
- `OLLAMA_MODEL` — default `gemma3:1b`
