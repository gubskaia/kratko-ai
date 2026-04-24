from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from .models import UploadedFile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ('username', 'password', 'email')

    def validate_username(self, value):
        username = value.strip()
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return username

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', '').lower(),
            password=validated_data['password']
        )
        return user


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        login_value = (attrs.get('username') or '').strip()
        password = attrs.get('password')

        if not login_value or not password:
            raise AuthenticationFailed("Enter your email or username and password.")

        lookup = {'email__iexact': login_value} if '@' in login_value else {'username__iexact': login_value}
        user = User.objects.filter(**lookup).first()

        if not user:
            raise AuthenticationFailed("No account found with that email or username.")

        attrs['username'] = user.username
        return super().validate(attrs)

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
            'extracted_text',
            'summary',
            'error_message'
        ]
        read_only_fields = ['uploaded_at', 'file_type', 'status', 'extracted_text', 'summary', 'error_message']
