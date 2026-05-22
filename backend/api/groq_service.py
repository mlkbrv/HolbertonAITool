import json
import logging
import re

from django.conf import settings

logger = logging.getLogger(__name__)

_last_groq_error: str | None = None
FALLBACK_MODEL = 'llama-3.3-70b-versatile'


def is_groq_configured() -> bool:
    return bool(getattr(settings, 'GROQ_API_KEY', ''))


def get_last_groq_error() -> str | None:
    return _last_groq_error


def _set_error(msg: str) -> None:
    global _last_groq_error
    _last_groq_error = msg[:500]
    logger.warning('Groq API: %s', _last_groq_error)


def _clear_error() -> None:
    global _last_groq_error
    _last_groq_error = None


def _client():
    from groq import Groq

    return Groq(api_key=getattr(settings, 'GROQ_API_KEY', ''))


def _extract_text(completion) -> str:
    if not completion.choices:
        return ''
    message = completion.choices[0].message
    content = getattr(message, 'content', None) or ''
    if content.strip():
        return content.strip()
    reasoning = getattr(message, 'reasoning', None)
    if reasoning:
        return str(reasoning).strip()
    return ''


def _call_groq(messages: list[dict], max_tokens: int = 2048) -> str | None:
    api_key = getattr(settings, 'GROQ_API_KEY', '')
    if not api_key:
        _set_error('GROQ_API_KEY is not set')
        return None

    primary = getattr(settings, 'GROQ_MODEL', 'openai/gpt-oss-120b')
    reasoning = getattr(settings, 'GROQ_REASONING_EFFORT', 'medium') or None

    attempts: list[dict] = [
        {'model': primary, 'reasoning_effort': reasoning, 'max_completion_tokens': max_tokens},
        {'model': primary, 'max_completion_tokens': max_tokens},
        {'model': FALLBACK_MODEL, 'max_completion_tokens': max_tokens},
    ]

    client = _client()
    for attempt in attempts:
        kwargs: dict = {
            'messages': messages,
            'model': attempt['model'],
            'temperature': 0.7,
            'top_p': 1,
            'stream': False,
            'max_completion_tokens': attempt.get('max_completion_tokens', max_tokens),
        }
        if attempt.get('reasoning_effort'):
            kwargs['reasoning_effort'] = attempt['reasoning_effort']
        try:
            completion = client.chat.completions.create(**kwargs)
            text = _extract_text(completion)
            if text:
                _clear_error()
                logger.info('Groq OK model=%s', attempt['model'])
                return text
            _set_error(f"Empty response from {attempt['model']}")
        except Exception as exc:
            _set_error(f"{attempt['model']}: {exc}")
    return None


def ping_groq() -> tuple[bool, str | None]:
    if not is_groq_configured():
        return False, 'GROQ_API_KEY missing'
    text = _call_groq(
        [
            {
                'role': 'user',
                'content': 'Reply with exactly: {"ok":true}',
            }
        ],
        max_tokens=64,
    )
    if text:
        return True, None
    return False, get_last_groq_error()


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
    if text:
        return {'text': text, 'options': []}
    return {'text': '', 'options': []}


def generate_detective_reply(session, user_text: str) -> dict | None:
    system = (
        'You are Giftly Gift Detective, a warm gift concierge. '
        'Help choose thoughtful gifts using the recipient profile and chat history. '
        'Reply ONLY with valid JSON: {"text": "markdown reply", "options": ["choice1", "choice2"]}. '
        'Keep text under 120 words. Offer 0-3 short option chips when a clear fork exists.\n\n'
        f'Profile:\n{_session_context(session)}'
    )
    messages: list[dict] = [{'role': 'system', 'content': system}]
    for msg in session.messages.order_by('created_at')[:20]:
        role = 'user' if msg.role == 'user' else 'assistant'
        messages.append({'role': role, 'content': msg.text})
    messages.append({'role': 'user', 'content': user_text})

    raw = _call_groq(messages)
    if not raw:
        return None
    parsed = _parse_reply(raw)
    return parsed if parsed.get('text') else None


def _groq_json_completion(system: str, user: str) -> dict | None:
    raw = _call_groq(
        [
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': user},
        ],
        max_tokens=4096,
    )
    if not raw:
        return None
    text = raw.strip()
    fence = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        _set_error(f'Invalid JSON from Groq: {text[:120]}')
        return None


def analyze_instagram_profile(username: str, profile_url: str, public_hints: str, gift_catalog: str) -> dict | None:
    system = (
        'You are Giftly AI analyzing a public Instagram profile to recommend gifts. '
        'Use username, URL, and any public hints. If hints are empty, infer plausible '
        'aesthetic/lifestyle interests from the handle and typical IG gift-buyer context, '
        'and say confidence is lower. '
        'Reply ONLY with valid JSON:\n'
        '{"text":"markdown summary for user","options":["chip1"],"trait":"str","mood":"str",'
        '"confidence_percent":0-100,"interests":[{"name":"str","score_percent":0-100,"level":"high|medium|low"}],'
        '"tags":["str"],"gift_picks":[{"gift_set_id":number,"match_percent":0-100,"reason":"str"}]}\n'
        'Pick 2-4 gift_set_id values from the catalog only. Keep text under 150 words.'
    )
    user = (
        f'Instagram: https://www.instagram.com/{username}/\n'
        f'Username: @{username}\n'
        f'Public metadata:\n{public_hints or "(not available — profile private or blocked)"}\n\n'
        f'Gift catalog:\n{gift_catalog}'
    )
    data = _groq_json_completion(system, user)
    if not isinstance(data, dict) or not data.get('text'):
        return None
    return data
