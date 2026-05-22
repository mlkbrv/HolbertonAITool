import json
import re

from django.conf import settings


def is_groq_configured() -> bool:
    return bool(getattr(settings, 'GROQ_API_KEY', ''))


def _session_context(session) -> str:
    recipient = session.recipient
    lines = [f'Recipient: {recipient.name} ({recipient.relationship})']
    try:
        profile = recipient.personality
    except Exception:
        profile = None
    if profile:
        if profile.trait:
            lines.append(f'Trait: {profile.trait}')
        if profile.mood:
            lines.append(f'Mood: {profile.mood}')
        tags = list(profile.tags.values_list('label', flat=True))
        if tags:
            lines.append(f'Tags: {", ".join(tags)}')
        interests = profile.interests.order_by('-score_percent')[:6]
        if interests:
            lines.append(
                'Interests: '
                + ', '.join(f'{i.name} ({i.score_percent}%)' for i in interests)
            )
    return '\n'.join(lines)


def _parse_reply(raw: str) -> dict:
    text = raw.strip()
    fence = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if fence:
        text = fence.group(1).strip()
    try:
        data = json.loads(text)
        if isinstance(data, dict) and data.get('text'):
            opts = data.get('options') or []
            return {
                'text': str(data['text']).strip(),
                'options': [str(o) for o in opts[:4] if o],
            }
    except json.JSONDecodeError:
        pass
    return {'text': raw.strip(), 'options': []}


def generate_detective_reply(session, user_text: str) -> dict | None:
    api_key = getattr(settings, 'GROQ_API_KEY', '')
    if not api_key:
        return None

    from groq import Groq

    client = Groq(api_key=api_key)
    model = getattr(settings, 'GROQ_MODEL', 'openai/gpt-oss-120b')

    system = (
        'You are Giftly Gift Detective, a warm gift concierge. '
        'Help choose thoughtful gifts using the recipient profile and chat history. '
        'Reply ONLY with valid JSON: {"text": "markdown reply", "options": ["choice1", "choice2"]}. '
        'Keep text under 120 words. Offer 0-3 short option chips when a clear fork exists.\n\n'
        f'Profile:\n{_session_context(session)}'
    )

    messages: list[dict[str, str]] = [{'role': 'system', 'content': system}]
    for msg in session.messages.order_by('created_at')[:20]:
        role = 'user' if msg.role == 'user' else 'assistant'
        messages.append({'role': role, 'content': msg.text})
    messages.append({'role': 'user', 'content': user_text})

    kwargs: dict = {
        'model': model,
        'messages': messages,
        'temperature': getattr(settings, 'GROQ_TEMPERATURE', 1),
        'max_completion_tokens': getattr(settings, 'GROQ_MAX_TOKENS', 8192),
        'top_p': getattr(settings, 'GROQ_TOP_P', 1),
        'stream': False,
    }
    reasoning = getattr(settings, 'GROQ_REASONING_EFFORT', 'medium')
    if reasoning:
        kwargs['reasoning_effort'] = reasoning

    completion = client.chat.completions.create(**kwargs)
    raw = completion.choices[0].message.content or ''
    return _parse_reply(raw)
