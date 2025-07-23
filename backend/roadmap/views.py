from rest_framework import generics, status, filters, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from django.views.decorators.csrf import csrf_exempt
from .models import RoadmapItem, Upvote, Comment
from .serializers import (
    UserSerializer, UserRegistrationSerializer, RoadmapItemSerializer,
    RoadmapItemDetailSerializer, UpvoteSerializer, CommentSerializer,
    CommentCreateSerializer
)


# Create your views here.

# Authentication Views
@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """User registration endpoint"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """User login endpoint"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if username and password:
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Login successful'
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({
            'error': 'Username and password required'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    """User logout endpoint"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logout successful'})
    except:
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)


# Roadmap Views
class RoadmapItemListView(generics.ListAPIView):
    """List all roadmap items with filtering and sorting"""
    queryset = RoadmapItem.objects.all()
    serializer_class = RoadmapItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['status', 'category']
    ordering_fields = ['created_at', 'priority', 'upvote_count']
    ordering = ['-priority', '-created_at']
    search_fields = ['title', 'description']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Custom filtering for popularity (upvote count)
        sort_by = self.request.query_params.get('sort_by')
        if sort_by == 'popularity':
            queryset = queryset.annotate(
                upvote_count_annotated=models.Count('upvotes')
            ).order_by('-upvote_count_annotated')
        
        return queryset


class RoadmapItemDetailView(generics.RetrieveAPIView):
    """Get detailed view of a roadmap item with comments"""
    queryset = RoadmapItem.objects.all()
    serializer_class = RoadmapItemDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# Upvoting Views
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_upvote(request, roadmap_id):
    """Toggle upvote for a roadmap item"""
    try:
        roadmap_item = RoadmapItem.objects.get(id=roadmap_id)
    except RoadmapItem.DoesNotExist:
        return Response({'error': 'Roadmap item not found'}, status=status.HTTP_404_NOT_FOUND)
    
    upvote, created = Upvote.objects.get_or_create(
        user=request.user,
        roadmap_item=roadmap_item
    )
    
    if not created:
        # If upvote already exists, remove it
        upvote.delete()
        return Response({
            'message': 'Upvote removed',
            'upvoted': False,
            'upvote_count': roadmap_item.upvote_count
        })
    else:
        # If upvote was created, return success
        return Response({
            'message': 'Upvote added',
            'upvoted': True,
            'upvote_count': roadmap_item.upvote_count
        })


# Comment Views
class RoadmapCommentsView(generics.ListCreateAPIView):
    """List and create comments for a roadmap item"""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        roadmap_id = self.kwargs['roadmap_id']
        # Return all comments for this roadmap item (flat structure for frontend to organize)
        return Comment.objects.filter(roadmap_item_id=roadmap_id).order_by('created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == 'POST':
            roadmap_id = self.kwargs['roadmap_id']
            try:
                context['roadmap_item'] = RoadmapItem.objects.get(id=roadmap_id)
            except RoadmapItem.DoesNotExist:
                pass
        return context


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a comment"""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_object(self):
        obj = super().get_object()
        # Users can only edit/delete their own comments
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if obj.user != self.request.user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only edit your own comments.")
        return obj


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def user_profile(request):
    """Get current user profile"""
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
