from django.db import models


class Recipient(models.Model):
    RELATIONSHIP_CHOICES = [
        ('mom', 'Mom'),
        ('partner', 'Partner'),
        ('colleague', 'Colleague'),
        ('friend', 'Friend'),
        ('client', 'Client'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=120)
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, default='other')
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class GiftCategory(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=80)

    class Meta:
        verbose_name_plural = 'gift categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class GiftSet(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField()
    category = models.ForeignKey(
        GiftCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gift_sets',
    )
    edition_label = models.CharField(max_length=80, blank=True)
    match_percent = models.PositiveSmallIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    is_curated = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-match_percent', 'title']

    def __str__(self):
        return self.title


class RecipientGiftMatch(models.Model):
    recipient = models.ForeignKey(Recipient, on_delete=models.CASCADE, related_name='gift_matches')
    gift_set = models.ForeignKey(GiftSet, on_delete=models.CASCADE, related_name='recipient_matches')
    match_percent = models.PositiveSmallIntegerField()
    label = models.CharField(max_length=120, blank=True)

    class Meta:
        unique_together = [('recipient', 'gift_set')]
        ordering = ['-match_percent']

    def __str__(self):
        return f'{self.recipient.name} — {self.gift_set.title}'


class Occasion(models.Model):
    TYPE_CHOICES = [
        ('birthday', 'Birthday'),
        ('anniversary', 'Anniversary'),
        ('retirement', 'Retirement'),
        ('wedding', 'Wedding'),
        ('holiday', 'Holiday'),
        ('milestone', 'Custom Milestone'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('analysis_required', 'Analysis Required'),
        ('gift_ready', 'Gift Ready'),
        ('ready', 'Ready'),
        ('shipped', 'Shipped'),
    ]

    title = models.CharField(max_length=200)
    recipient = models.ForeignKey(
        Recipient,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='occasions',
    )
    occasion_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='birthday')
    date = models.DateField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='planned')
    progress_percent = models.PositiveSmallIntegerField(default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return self.title


class SavedGift(models.Model):
    gift_set = models.ForeignKey(GiftSet, on_delete=models.CASCADE, related_name='saved_entries')
    recipient = models.ForeignKey(Recipient, on_delete=models.CASCADE, related_name='saved_gifts')
    occasion_date = models.DateField()
    match_percent = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['occasion_date']

    def __str__(self):
        return f'{self.gift_set.title} for {self.recipient.name}'


class PersonalityProfile(models.Model):
    recipient = models.OneToOneField(Recipient, on_delete=models.CASCADE, related_name='personality')
    confidence_percent = models.PositiveSmallIntegerField(default=0)
    trait = models.CharField(max_length=80, blank=True)
    mood = models.CharField(max_length=80, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Profile: {self.recipient.name}'


class Interest(models.Model):
    LEVEL_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    profile = models.ForeignKey(PersonalityProfile, on_delete=models.CASCADE, related_name='interests')
    name = models.CharField(max_length=120)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='medium')
    score_percent = models.PositiveSmallIntegerField(default=50)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return self.name


class PersonalityTag(models.Model):
    profile = models.ForeignKey(PersonalityProfile, on_delete=models.CASCADE, related_name='tags')
    label = models.CharField(max_length=60)

    def __str__(self):
        return self.label


class DetectiveSession(models.Model):
    recipient = models.ForeignKey(Recipient, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=200, default='Gift Detective Session')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('ai', 'AI'),
        ('user', 'User'),
    ]

    session = models.ForeignKey(DetectiveSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    text = models.TextField()
    time_label = models.CharField(max_length=30, blank=True)
    options = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.role}: {self.text[:40]}'


class CorporateOffer(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    is_new = models.BooleanField(default=False)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return self.title


class DashboardInsight(models.Model):
    readiness_percent = models.PositiveSmallIntegerField(default=72)
    quote = models.TextField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'Insight {self.readiness_percent}%'
