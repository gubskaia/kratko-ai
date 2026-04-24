from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UploadedFileViewSet, RegisterView, EmailOrUsernameLoginView

router = DefaultRouter()
router.register(r'uploads', UploadedFileViewSet, basename='uploads')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', EmailOrUsernameLoginView.as_view(), name='login'),
    path('', include(router.urls)),
]
