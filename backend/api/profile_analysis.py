from .models import GiftSet, Interest, PersonalityProfile, PersonalityTag, RecipientGiftMatch


def apply_instagram_analysis(recipient, data: dict) -> PersonalityProfile:
    profile, _ = PersonalityProfile.objects.get_or_create(recipient=recipient)
    if data.get('trait'):
        profile.trait = str(data['trait'])[:80]
    if data.get('mood'):
        profile.mood = str(data['mood'])[:80]
    conf = data.get('confidence_percent')
    if conf is not None:
        try:
            profile.confidence_percent = min(100, max(0, int(conf)))
        except (TypeError, ValueError):
            pass
    profile.save()

    profile.interests.all().delete()
    for i, item in enumerate(data.get('interests') or []):
        if not isinstance(item, dict):
            continue
        name = str(item.get('name', '')).strip()[:120]
        if not name:
            continue
        level = str(item.get('level', 'medium'))[:10]
        if level not in ('high', 'medium', 'low'):
            level = 'medium'
        try:
            score = min(100, max(0, int(item.get('score_percent', 50))))
        except (TypeError, ValueError):
            score = 50
        Interest.objects.create(
            profile=profile,
            name=name,
            level=level,
            score_percent=score,
            sort_order=i,
        )

    profile.tags.all().delete()
    for label in (data.get('tags') or [])[:8]:
        text = str(label).strip()[:60]
        if text:
            PersonalityTag.objects.create(profile=profile, label=text)

    for pick in (data.get('gift_picks') or [])[:4]:
        if not isinstance(pick, dict):
            continue
        try:
            gid = int(pick.get('gift_set_id'))
        except (TypeError, ValueError):
            continue
        if not GiftSet.objects.filter(pk=gid).exists():
            continue
        try:
            match_percent = min(100, max(0, int(pick.get('match_percent', 90))))
        except (TypeError, ValueError):
            match_percent = 90
        RecipientGiftMatch.objects.update_or_create(
            recipient=recipient,
            gift_set_id=gid,
            defaults={'match_percent': match_percent, 'label': 'Instagram match'},
        )

    return PersonalityProfile.objects.select_related('recipient').prefetch_related(
        'interests', 'tags'
    ).get(pk=profile.pk)
