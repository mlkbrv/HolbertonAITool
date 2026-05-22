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

    try:
        completion = client.chat.completions.create(**kwargs)
        raw = completion.choices[0].message.content or ''
        return _parse_reply(raw)
    except Exception:
        return None


def _groq_json_completion(system: str, user: str) -> dict | None:
    api_key = getattr(settings, 'GROQ_API_KEY', '')
    if not api_key:
        return None
    from groq import Groq

    client = Groq(api_key=api_key)
    model = getattr(settings, 'GROQ_MODEL', 'openai/gpt-oss-120b')
    kwargs: dict = {
        'model': model,
        'messages': [
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': user},
        ],
        'temperature': 0.7,
        'max_completion_tokens': 4096,
        'top_p': 1,
        'stream': False,
    }
    reasoning = getattr(settings, 'GROQ_REASONING_EFFORT', 'medium')
    if reasoning:
        kwargs['reasoning_effort'] = reasoning
    try:
        completion = client.chat.completions.create(**kwargs)
        raw = completion.choices[0].message.content or ''
        text = raw.strip()
        fence = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if fence:
            text = fence.group(1).strip()
        return json.loads(text)
    except Exception:
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
