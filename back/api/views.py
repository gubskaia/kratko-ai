import os
import logging

from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import UploadedFile
from .processors import process_uploaded_file
from .serializers import (
    EmailOrUsernameTokenObtainPairSerializer,
    RegisterSerializer,
    UploadedFileSerializer,
)


logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class EmailOrUsernameLoginView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class UploadedFileViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = UploadedFileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return UploadedFile.objects.filter(user=self.request.user).order_by("-uploaded_at")

    def perform_create(self, serializer):
        title = serializer.validated_data.get("title", "").strip()
        uploaded_file = serializer.validated_data["file"]
        instance = serializer.save(
            user=self.request.user,
            title=title or os.path.basename(uploaded_file.name),
        )
        self._process_instance(instance)

    @action(detail=True, methods=["post"])
    def retry(self, request, pk=None):
        instance = self.get_object()

        if instance.status == UploadedFile.Status.PROCESSING:
            return Response(
                {"error": "File processing is already in progress."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.status = UploadedFile.Status.PENDING
        instance.summary = ""
        instance.extracted_text = ""
        instance.error_message = ""
        instance.save(update_fields=["status", "summary", "extracted_text", "error_message"])

        self._process_instance(instance)
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _process_instance(self, instance: UploadedFile) -> None:
        try:
            process_uploaded_file(instance)
        except Exception:
            logger.exception("Unexpected error while processing uploaded file", extra={"uploaded_file_id": instance.pk})
