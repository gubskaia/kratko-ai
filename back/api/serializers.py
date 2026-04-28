import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.validators import UnicodeUsernameValidator
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UploadedFile


User = get_user_model()
username_validator = UnicodeUsernameValidator()

DEFAULT_ALLOWED_EXTENSIONS = (".pdf", ".docx", ".txt")
DEFAULT_MAX_UPLOAD_SIZE = 10 * 1024 * 1024


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False, style={"input_type": "password"})
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ("username", "password", "email")

    def validate_username(self, value: str) -> str:
        username = value.strip()
        if not username:
            raise serializers.ValidationError("Username cannot be empty.")

        username_validator(username)

        if len(username) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")

        if len(username) > 30:
            raise serializers.ValidationError("Username must be 30 characters or fewer.")

        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("A user with this username already exists.")

        return username

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_password(self, value: str) -> str:
        username = (self.initial_data.get("username") or "").strip()
        email = (self.initial_data.get("email") or "").strip().lower()
        temp_user = User(username=username, email=email)
        validate_password(value, user=temp_user)
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        login_value = (attrs.get("username") or "").strip()
        password = attrs.get("password")

        if not login_value or not password:
            raise AuthenticationFailed("Enter your email or username and password.")

        lookup = {"email__iexact": login_value} if "@" in login_value else {"username__iexact": login_value}
        user = User.objects.filter(**lookup).first()

        if not user:
            raise AuthenticationFailed("No account found with that email or username.")

        attrs["username"] = user.username
        return super().validate(attrs)


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "title",
            "file",
            "uploaded_at",
            "file_type",
            "status",
            "extracted_text",
            "summary",
            "error_message",
        ]
        read_only_fields = ["uploaded_at", "file_type", "status", "extracted_text", "summary", "error_message"]

    def validate_file(self, value):
        allowed_extensions = tuple(
            extension.lower()
            for extension in getattr(settings, "ALLOWED_UPLOAD_EXTENSIONS", DEFAULT_ALLOWED_EXTENSIONS)
        )
        max_size = getattr(settings, "MAX_UPLOAD_SIZE_BYTES", DEFAULT_MAX_UPLOAD_SIZE)
        extension = os.path.splitext(value.name)[1].lower()

        if extension not in allowed_extensions:
            allowed_display = ", ".join(allowed_extensions)
            raise serializers.ValidationError(f"Unsupported file type. Allowed types: {allowed_display}.")

        if value.size > max_size:
            raise serializers.ValidationError(
                f"File is too large. Maximum allowed size is {max_size // (1024 * 1024)} MB."
            )

        return value

    def validate_title(self, value: str) -> str:
        return value.strip()
