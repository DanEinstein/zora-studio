from app.schemas.request import GenerateRequest, Platform


_PLATFORM_RULES: dict[Platform, str] = {
    Platform.linkedin: (
        "Target: LinkedIn post.\n"
        "- Length: 150–300 words, strictly under 3,000 characters.\n"
        "- Format: short paragraphs, bullet lists, and optional light emoji use.\n"
        "- Professional and energetic; lead with key takeaways.\n"
        "- End with a clear engagement question for comments.\n"
        "- If hashtags are enabled, place a trailing hashtag block at the end."
    ),
    Platform.medium: (
        "Target: Medium article draft.\n"
        "- Length: 600–1,200 words.\n"
        "- Format: full Markdown with H2/H3 headers and clear sub-sections.\n"
        "- Include in-depth technical explanation, ELI5 analogies where helpful, "
        "and architectural breakdown.\n"
        "- If code is enabled, include properly fenced Markdown code blocks."
    ),
    Platform.substack: (
        "Target: Substack newsletter issue.\n"
        "- Length: 400–800 words.\n"
        "- Format: newsletter style with a warm introduction, structured key "
        "points, and a concise conclusion.\n"
        "- Tone should feel personal and conversational — developer-to-developer."
    ),
}


def build_system_prompt(req: GenerateRequest) -> str:
    platform_rules = _PLATFORM_RULES[req.platform]
    hashtags_line = (
        "Include relevant hashtags."
        if req.include_hashtags
        else "Do NOT include hashtags."
    )
    code_line = (
        "Include code snippets where useful."
        if req.include_code
        else "Do NOT include code snippets."
    )

    refinement_block = ""
    if req.refinement:
        refinement_block = (
            f"\n- Refinement instruction: {req.refinement}\n"
            "- Rewrite/refine the prior content according to this instruction. "
            "Use the provided context as the previous draft when present."
        )

    return (
        "You are Zora, an expert technical writer for developers.\n"
        f"Format the output strictly for platform: {req.platform.value}.\n"
        "Rules:\n"
        "- Directly output the FINAL post content only. "
        "Do NOT include greetings, preamble, meta commentary, or explanations "
        "about what you are writing.\n"
        f"- Use tone: {req.tone.value}.\n"
        f"- {hashtags_line}\n"
        f"- {code_line}\n"
        f"\nPlatform constraints:\n{platform_rules}"
        f"{refinement_block}"
    )


def build_user_prompt(req: GenerateRequest, assembled_context: str) -> str:
    parts = [
        f"Topic: {req.topic}",
        f"Assembled context:\n{assembled_context}",
    ]
    if req.refinement:
        parts.append(
            f"Apply this refinement: {req.refinement}\n"
            "Rewrite the content accordingly and output only the updated final post."
        )
    else:
        parts.append("Generate the post now. Output only the final content.")
    return "\n\n".join(parts)


def build_prompts(req: GenerateRequest, assembled_context: str) -> tuple[str, str]:
    return build_system_prompt(req), build_user_prompt(req, assembled_context)
