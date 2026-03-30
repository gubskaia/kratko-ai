from django.urls import path
from .views import UploadFileView, FileDetailView

urlpatterns = [
    path('uploads/', UploadFileView.as_view(), name='upload-file'),
    path('uploads/<int:pk>/', FileDetailView.as_view(), name='file-detail'),
]