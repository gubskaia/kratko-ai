from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import UploadedFile
from .serializers import UploadedFileSerializer
from .processors import process_uploaded_file


class UploadedFileViewSet(viewsets.ModelViewSet):
    """
    ViewSet для полного CRUD операций с загруженными файлами.
    Поддерживает загрузку, просмотр списка, детальный просмотр, обновление и удаление.
    """
    queryset = UploadedFile.objects.all().order_by('-uploaded_at')
    serializer_class = UploadedFileSerializer

    def create(self, request, *args, **kwargs):
        """Переопределяем создание для автоматической обработки файла ИИ"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Сохраняем файл в базу
        instance = serializer.save()

        # Если пользователь не передал название — используем имя файла
        if not instance.title:
            instance.title = instance.file.name
            instance.save()

        # Запускаем обработку через ИИ (извлечение текста + пересказ)
        try:
            process_uploaded_file(instance)
        except Exception:
            pass  # Ошибка уже сохранена в модели (status = 'failed')

        headers = self.get_success_headers(serializer.data)
        return Response(
            UploadedFileSerializer(instance).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Дополнительное действие: перезапустить обработку файла"""
        instance = self.get_object()

        if instance.status in ['failed', 'completed']:
            # Сбрасываем статус и результаты
            instance.status = 'pending'
            instance.summary = ''
            instance.error_message = ''
            instance.save()

            try:
                process_uploaded_file(instance)
                return Response({"message": "Повторная обработка успешно запущена"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"error": "Файл уже находится в процессе обработки"},
            status=status.HTTP_400_BAD_REQUEST
        )