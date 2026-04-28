from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import UploadedFile


User = get_user_model()


class AuthenticationApiTests(APITestCase):
    def test_register_creates_user(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "testuser",
                "email": "USER@Example.com",
                "password": "strong-pass-123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="testuser")
        self.assertEqual(user.email, "user@example.com")

    def test_login_with_email_returns_tokens(self):
        User.objects.create_user(
            username="testuser",
            email="user@example.com",
            password="strong-pass-123",
        )

        response = self.client.post(
            reverse("login"),
            {"username": "user@example.com", "password": "strong-pass-123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)


class UploadedFileApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="user@example.com",
            password="strong-pass-123",
        )
        self.client.force_authenticate(self.user)

    @patch("api.views.process_uploaded_file")
    def test_upload_sets_default_title_and_processes_file(self, mock_process_uploaded_file):
        def fake_process(instance):
            instance.status = UploadedFile.Status.COMPLETED
            instance.summary = "Processed summary"
            instance.error_message = ""
            instance.save(update_fields=["status", "summary", "error_message"])

        mock_process_uploaded_file.side_effect = fake_process

        upload = SimpleUploadedFile("weather.txt", b"Sunny day", content_type="text/plain")
        response = self.client.post(reverse("uploads-list"), {"file": upload}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "weather.txt")
        self.assertEqual(response.data["status"], UploadedFile.Status.COMPLETED)
        self.assertEqual(response.data["summary"], "Processed summary")
        self.assertEqual(UploadedFile.objects.count(), 1)

    def test_upload_rejects_unsupported_extension(self):
        upload = SimpleUploadedFile("malware.exe", b"binary", content_type="application/octet-stream")
        response = self.client.post(reverse("uploads-list"), {"file": upload}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("file", response.data)

    @patch("api.views.process_uploaded_file")
    def test_retry_resets_fields_and_reprocesses_file(self, mock_process_uploaded_file):
        file_record = UploadedFile.objects.create(
            user=self.user,
            title="weather.txt",
            file=SimpleUploadedFile("weather.txt", b"source text", content_type="text/plain"),
            status=UploadedFile.Status.FAILED,
            summary="Old summary",
            extracted_text="Old text",
            error_message="Old error",
        )

        def fake_process(instance):
            self.assertEqual(instance.summary, "")
            self.assertEqual(instance.extracted_text, "")
            self.assertEqual(instance.error_message, "")
            instance.status = UploadedFile.Status.COMPLETED
            instance.summary = "New summary"
            instance.extracted_text = "New text"
            instance.save(update_fields=["status", "summary", "extracted_text"])

        mock_process_uploaded_file.side_effect = fake_process

        response = self.client.post(reverse("uploads-retry", args=[file_record.pk]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        file_record.refresh_from_db()
        self.assertEqual(file_record.status, UploadedFile.Status.COMPLETED)
        self.assertEqual(file_record.summary, "New summary")
        self.assertEqual(file_record.extracted_text, "New text")
