import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.prompts.templates import build_prompts
from app.schemas.request import GenerateRequest
from app.services.ollama_client import MODEL_NAME, check_ollama, stream_generate

MAX_CONTEXT_CHARS = 4000

app = FastAPI(title="Zora API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def assemble_context(req: GenerateRequest) -> str:
    parts: list[str] = []
    if req.topic.strip():
        parts.append(req.topic.strip())
    if req.context.strip():
        parts.append(req.context.strip())
    if req.code_notes.strip():
        parts.append(f"Code notes:\n{req.code_notes.strip()}")
    if req.tags:
        tag_str = " ".join(t.strip() for t in req.tags if t and t.strip())
        if tag_str:
            parts.append(f"Tags: {tag_str}")
    assembled = "\n\n".join(parts)
    if len(assembled) > MAX_CONTEXT_CHARS:
        assembled = assembled[:MAX_CONTEXT_CHARS]
    return assembled


@app.get("/api/v1/health")
async def health() -> dict:
    ollama_ok, model_ready = await check_ollama()
    return {
        "ok": True,
        "ollama": ollama_ok,
        "model": MODEL_NAME,
        "model_ready": model_ready,
    }


@app.post("/api/v1/generate")
async def generate(req: GenerateRequest) -> StreamingResponse:
    assembled = assemble_context(req)
    system_prompt, user_prompt = build_prompts(req, assembled)

    async def event_stream():
        try:
            async for token in stream_generate(system_prompt, user_prompt):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
