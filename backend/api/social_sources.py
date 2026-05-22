import re
from html import unescape
from urllib.request import Request, urlopen

INSTAGRAM_URL_RE = re.compile(
    r'(?:https?://)?(?:www\.)?instagram\.com/([A-Za-z0-9._]{1,30})/?',
    re.IGNORECASE,
)
HANDLE_RE = re.compile(r'^@?([A-Za-z0-9._]{1,30})$')
RESERVED = frozenset(
    {'p', 'reel', 'reels', 'stories', 'explore', 'accounts', 'direct', 'tv', 'about'}
)


def parse_instagram_username(url_or_handle: str) -> str | None:
    raw = (url_or_handle or '').strip()
    if not raw:
        return None
    if raw.startswith('@'):
        raw = raw[1:].split('/')[0].split('?')[0]
        return raw if raw and raw.lower() not in RESERVED else None
    match = INSTAGRAM_URL_RE.search(raw)
    if match:
        user = match.group(1)
        return None if user.lower() in RESERVED else user
    match = HANDLE_RE.match(raw.split('?')[0])
    if match:
        user = match.group(1)
        return None if user.lower() in RESERVED else user
    return None


def fetch_instagram_public_hints(username: str) -> str:
    url = f'https://www.instagram.com/{username}/'
    req = Request(
        url,
        headers={
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ),
            'Accept-Language': 'en-US,en;q=0.9',
        },
    )
    try:
        with urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
    except Exception:
        return ''

    parts: list[str] = []
    for pattern in (
        r'<meta\s+property="og:description"\s+content="([^"]*)"',
        r'<meta\s+content="([^"]*)"\s+property="og:description"',
        r'<meta\s+property="og:title"\s+content="([^"]*)"',
        r'"biography":"([^"]*)"',
    ):
        for m in re.finditer(pattern, html, re.IGNORECASE):
            text = unescape(m.group(1)).strip()
            if text and text not in parts:
                parts.append(text)
    if parts:
        return '\n'.join(parts[:5])
    return ''
