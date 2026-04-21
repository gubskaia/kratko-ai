from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UploadedFileViewSet, RegisterView

router = DefaultRouter()
router.register(r'uploads', UploadedFileViewSet, basename='uploads')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]