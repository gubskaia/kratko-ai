from rest_framework import serializers
from .models import UploadedFile

class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ['id', 'title', 'file', 'uploaded_at', 'file_type', 'status', 'summary', 'error_message']
        read_only_fields = ['uploaded_at', 'file_type', 'status', 'summary', 'error_message']