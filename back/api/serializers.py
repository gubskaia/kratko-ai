from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UploadedFile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = [
            'id',
            'title',
            'file',
            'uploaded_at',
            'file_type',
            'status',
            'summary',
            'error_message'
        ]
        read_only_fields = ['uploaded_at', 'file_type', 'status', 'summary', 'error_message']