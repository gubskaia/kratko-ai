from django.contrib import admin

from .models import UploadedFile


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "status", "uploaded_at")
    list_filter = ("status", "uploaded_at")
    search_fields = ("title", "file", "user__username", "user__email")
    readonly_fields = ("uploaded_at", "file_type", "extracted_text", "summary", "error_message")
