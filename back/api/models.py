import os

from django.conf import settings
from django.db import models


class UploadedFile(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Ожидает"
        PROCESSING = "processing", "Обрабатывается"
        COMPLETED = "completed", "Готово"
        FAILED = "failed", "Ошибка"

    title = models.CharField(max_length=255, blank=True, verbose_name="Название")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="files",
        null=True,
        blank=True,
    )
    file = models.FileField(upload_to="uploads/", verbose_name="Файл")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_type = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    extracted_text = models.TextField(blank=True)
    summary = models.TextField(blank=True, verbose_name="Краткий пересказ")
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = "Загруженный файл"
        verbose_name_plural = "Загруженные файлы"

    def __str__(self) -> str:
        return self.title or self.original_filename

    @property
    def original_filename(self) -> str:
        return os.path.basename(self.file.name)

    def ensure_title(self) -> None:
        if not self.title:
            self.title = self.original_filename
