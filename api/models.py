from django.db import models

class UploadedFile(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает'),
        ('processing', 'Обрабатывается'),
        ('completed', 'Готово'),
        ('failed', 'Ошибка'),
    ]

    title = models.CharField(max_length=255, blank=True, verbose_name="Название")
    file = models.FileField(upload_to='uploads/', verbose_name="Файл")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_type = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    extracted_text = models.TextField(blank=True)
    summary = models.TextField(blank=True, verbose_name="Краткий пересказ")
    error_message = models.TextField(blank=True)

    def __str__(self):
        return self.title or self.file.name

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Загруженный файл"
        verbose_name_plural = "Загруженные файлы"