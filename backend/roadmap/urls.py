from django.urls import path
from . import views

app_name = 'roadmap'

urlpatterns = [
    # Authentication URLs
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/profile/', views.user_profile, name='user_profile'),
    
    # Roadmap URLs
    path('roadmap/', views.RoadmapItemListView.as_view(), name='roadmap_list'),
    path('roadmap/<int:pk>/', views.RoadmapItemDetailView.as_view(), name='roadmap_detail'),
    
    # Upvote URLs
    path('roadmap/<int:roadmap_id>/upvote/', views.toggle_upvote, name='toggle_upvote'),
    
    # Comment URLs
    path('roadmap/<int:roadmap_id>/comments/', views.RoadmapCommentsView.as_view(), name='roadmap_comments'),
    path('comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment_detail'),
] 