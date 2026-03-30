from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import UploadedFile
from .serializers import UploadedFileSerializer
from .processors import process_uploaded_file

class UploadFileView(APIView):
    def post(self, request):
        serializer = UploadedFileSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            if not instance.title:
                instance.title = instance.file.name
                instance.save()

            try:
                process_uploaded_file(instance)
            except Exception:
                pass  # ошибка уже сохранена в модели

            return Response(
                UploadedFileSerializer(instance).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FileDetailView(APIView):
    def get(self, request, pk):
        try:
            file_obj = UploadedFile.objects.get(pk=pk)
            return Response(UploadedFileSerializer(file_obj).data)
        except UploadedFile.DoesNotExist:
            return Response({"error": "Файл не найден"}, status=404)