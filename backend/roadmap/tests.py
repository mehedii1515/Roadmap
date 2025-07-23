from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from .models import RoadmapItem, Upvote, Comment
from .serializers import (
    UserRegistrationSerializer, RoadmapItemSerializer, 
    CommentSerializer, CommentCreateSerializer
)


class RoadmapItemModelTestCase(TestCase):
    """Test cases for RoadmapItem model"""
    
    def setUp(self):
        self.roadmap_item = RoadmapItem.objects.create(
            title="Test Feature",
            description="Test description",
            status="planning",
            category="feature",
            priority=5
        )
    
    def test_roadmap_item_creation(self):
        """Test roadmap item is created correctly"""
        self.assertEqual(self.roadmap_item.title, "Test Feature")
        self.assertEqual(self.roadmap_item.status, "planning")
        self.assertEqual(self.roadmap_item.category, "feature")
        self.assertEqual(self.roadmap_item.priority, 5)
    
    def test_roadmap_item_str_representation(self):
        """Test string representation of roadmap item"""
        self.assertEqual(str(self.roadmap_item), "Test Feature")
    
    def test_upvote_count_property(self):
        """Test upvote_count property returns correct count"""
        user = User.objects.create_user(username="testuser", password="testpass")
        Upvote.objects.create(user=user, roadmap_item=self.roadmap_item)
        self.assertEqual(self.roadmap_item.upvote_count, 1)
    
    def test_status_choices(self):
        """Test status field accepts valid choices"""
        valid_statuses = ['planning', 'in_progress', 'completed', 'on_hold', 'cancelled']
        for status in valid_statuses:
            item = RoadmapItem(
                title=f"Test {status}",
                description="Test",
                status=status,
                category="feature"
            )
            item.full_clean()  # Should not raise ValidationError
    
    def test_category_choices(self):
        """Test category field accepts valid choices"""
        valid_categories = ['feature', 'improvement', 'bug_fix', 'maintenance', 'research']
        for category in valid_categories:
            item = RoadmapItem(
                title=f"Test {category}",
                description="Test",
                status="planning",
                category=category
            )
            item.full_clean()  # Should not raise ValidationError


class UpvoteModelTestCase(TestCase):
    """Test cases for Upvote model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.roadmap_item = RoadmapItem.objects.create(
            title="Test Feature",
            description="Test description",
            status="planning",
            category="feature"
        )
    
    def test_upvote_creation(self):
        """Test upvote is created correctly"""
        upvote = Upvote.objects.create(user=self.user, roadmap_item=self.roadmap_item)
        self.assertEqual(upvote.user, self.user)
        self.assertEqual(upvote.roadmap_item, self.roadmap_item)
    
    def test_upvote_str_representation(self):
        """Test string representation of upvote"""
        upvote = Upvote.objects.create(user=self.user, roadmap_item=self.roadmap_item)
        expected_str = f"{self.user.username} upvoted {self.roadmap_item.title}"
        self.assertEqual(str(upvote), expected_str)
    
    def test_unique_upvote_constraint(self):
        """Test that a user cannot upvote the same item twice"""
        Upvote.objects.create(user=self.user, roadmap_item=self.roadmap_item)
        
        with self.assertRaises(IntegrityError):
            Upvote.objects.create(user=self.user, roadmap_item=self.roadmap_item)
    
    def test_multiple_users_can_upvote_same_item(self):
        """Test that multiple users can upvote the same item"""
        user2 = User.objects.create_user(username="testuser2", password="testpass")
        
        upvote1 = Upvote.objects.create(user=self.user, roadmap_item=self.roadmap_item)
        upvote2 = Upvote.objects.create(user=user2, roadmap_item=self.roadmap_item)
        
        self.assertEqual(Upvote.objects.filter(roadmap_item=self.roadmap_item).count(), 2)


class CommentModelTestCase(TestCase):
    """Test cases for Comment model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.roadmap_item = RoadmapItem.objects.create(
            title="Test Feature",
            description="Test description",
            status="planning",
            category="feature"
        )
    
    def test_comment_creation(self):
        """Test comment is created correctly"""
        comment = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="Test comment"
        )
        self.assertEqual(comment.user, self.user)
        self.assertEqual(comment.roadmap_item, self.roadmap_item)
        self.assertEqual(comment.content, "Test comment")
        self.assertIsNone(comment.parent_comment)
    
    def test_comment_str_representation(self):
        """Test string representation of comment"""
        comment = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="Test comment"
        )
        expected_str = f"Comment by {self.user.username} on {self.roadmap_item.title}"
        self.assertEqual(str(comment), expected_str)
    
    def test_comment_depth_calculation(self):
        """Test comment depth level calculation"""
        # Top-level comment (depth 0)
        parent_comment = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="Parent comment"
        )
        self.assertEqual(parent_comment.depth_level, 0)
        
        # First-level reply (depth 1)
        reply1 = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="First reply",
            parent_comment=parent_comment
        )
        self.assertEqual(reply1.depth_level, 1)
        
        # Second-level reply (depth 2)
        reply2 = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="Second reply",
            parent_comment=reply1
        )
        self.assertEqual(reply2.depth_level, 2)
    
    def test_can_have_replies_method(self):
        """Test can_have_replies method respects depth limits"""
        # Top-level comment can have replies
        parent_comment = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="Parent comment"
        )
        self.assertTrue(parent_comment.can_have_replies())
        
        # First-level reply can have replies
        reply1 = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="First reply",
            parent_comment=parent_comment
        )
        self.assertTrue(reply1.can_have_replies())
        
        # Second-level reply cannot have replies (max depth reached)
        reply2 = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="Second reply",
            parent_comment=reply1
        )
        self.assertFalse(reply2.can_have_replies())
    
    def test_is_reply_property(self):
        """Test is_reply property"""
        parent_comment = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="Parent comment"
        )
        self.assertFalse(parent_comment.is_reply)
        
        reply = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="Reply comment",
            parent_comment=parent_comment
        )
        self.assertTrue(reply.is_reply)
    
    def test_comment_content_length_validation(self):
        """Test comment content length is validated (300 char limit)"""
        long_content = "x" * 301  # 301 characters
        
        comment = Comment(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content=long_content
        )
        
        with self.assertRaises(ValidationError):
            comment.full_clean()


class UserRegistrationSerializerTestCase(TestCase):
    """Test cases for UserRegistrationSerializer"""
    
    def test_valid_registration_data(self):
        """Test serializer with valid registration data"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123',
            'password_confirm': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_password_mismatch_validation(self):
        """Test password confirmation validation"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123',
            'password_confirm': 'differentpassword',
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("Passwords don't match", str(serializer.errors))
    
    def test_user_creation(self):
        """Test user is created correctly"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123',
            'password_confirm': 'testpassword123',
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpassword123'))


class AuthenticationAPITestCase(APITestCase):
    """Test cases for authentication API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('roadmap:register')
        self.login_url = reverse('roadmap:login')
        self.logout_url = reverse('roadmap:logout')
    
    def test_user_registration_success(self):
        """Test successful user registration"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123',
            'password_confirm': 'testpassword123',
        }
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('token', response.data)
        self.assertTrue(User.objects.filter(username='testuser').exists())
    
    def test_user_registration_password_mismatch(self):
        """Test registration with password mismatch"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123',
            'password_confirm': 'differentpassword',
        }
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_user_login_success(self):
        """Test successful user login"""
        # Create user first
        user = User.objects.create_user(username='testuser', password='testpass123')
        
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('token', response.data)
    
    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
    
    def test_user_logout_success(self):
        """Test successful user logout"""
        user = User.objects.create_user(username='testuser', password='testpass123')
        token = Token.objects.create(user=user)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.post(self.logout_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Token.objects.filter(key=token.key).exists())


class RoadmapAPITestCase(APITestCase):
    """Test cases for roadmap API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.token = Token.objects.create(user=self.user)
        
        self.roadmap_item = RoadmapItem.objects.create(
            title="Test Feature",
            description="Test description",
            status="planning",
            category="feature",
            priority=5
        )
        
        self.list_url = reverse('roadmap:roadmap_list')
        self.detail_url = reverse('roadmap:roadmap_detail', kwargs={'pk': self.roadmap_item.pk})
        self.upvote_url = reverse('roadmap:toggle_upvote', kwargs={'roadmap_id': self.roadmap_item.pk})
    
    def test_roadmap_list_anonymous_user(self):
        """Test roadmap list is accessible to anonymous users"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_roadmap_list_authenticated_user(self):
        """Test roadmap list shows upvote status for authenticated users"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user_upvoted', response.data['results'][0])
        self.assertFalse(response.data['results'][0]['user_upvoted'])
    
    def test_roadmap_detail_view(self):
        """Test roadmap detail view"""
        response = self.client.get(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Test Feature")
        self.assertIn('comments', response.data)
    
    def test_upvote_toggle_authenticated(self):
        """Test upvote toggle for authenticated user"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        # First upvote
        response = self.client.post(self.upvote_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['upvoted'])
        
        # Remove upvote
        response = self.client.post(self.upvote_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['upvoted'])
    
    def test_upvote_toggle_anonymous(self):
        """Test upvote toggle fails for anonymous user"""
        response = self.client.post(self.upvote_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_roadmap_list_filtering(self):
        """Test roadmap list filtering by status and category"""
        # Create additional items
        RoadmapItem.objects.create(
            title="Bug Fix",
            description="Fix bug",
            status="completed",
            category="bug_fix"
        )
        
        # Filter by status
        response = self.client.get(self.list_url, {'status': 'planning'})
        self.assertEqual(len(response.data['results']), 1)
        
        # Filter by category
        response = self.client.get(self.list_url, {'category': 'feature'})
        self.assertEqual(len(response.data['results']), 1)
    
    def test_roadmap_list_search(self):
        """Test roadmap list search functionality"""
        response = self.client.get(self.list_url, {'search': 'Test Feature'})
        self.assertEqual(len(response.data['results']), 1)
        
        response = self.client.get(self.list_url, {'search': 'nonexistent'})
        self.assertEqual(len(response.data['results']), 0)


class CommentAPITestCase(APITestCase):
    """Test cases for comment API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.user2 = User.objects.create_user(username='testuser2', password='testpass123')
        self.token = Token.objects.create(user=self.user)
        
        self.roadmap_item = RoadmapItem.objects.create(
            title="Test Feature",
            description="Test description",
            status="planning",
            category="feature"
        )
        
        self.comment = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="Test comment"
        )
        
        self.comments_url = reverse('roadmap:roadmap_comments', kwargs={'roadmap_id': self.roadmap_item.pk})
        self.comment_detail_url = reverse('roadmap:comment_detail', kwargs={'pk': self.comment.pk})
    
    def test_comment_list_anonymous(self):
        """Test comment list is accessible to anonymous users"""
        response = self.client.get(self.comments_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_comment_creation_authenticated(self):
        """Test comment creation for authenticated user"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        data = {'content': 'New test comment'}
        response = self.client.post(self.comments_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'New test comment')
        self.assertEqual(Comment.objects.count(), 2)
    
    def test_comment_creation_anonymous(self):
        """Test comment creation fails for anonymous user"""
        data = {'content': 'New test comment'}
        response = self.client.post(self.comments_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_comment_reply_creation(self):
        """Test reply creation with proper nesting"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        data = {
            'content': 'Reply to comment',
            'parent_comment': self.comment.id
        }
        response = self.client.post(self.comments_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['parent_comment'], self.comment.id)
    
    def test_comment_update_owner(self):
        """Test comment update by owner"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        data = {'content': 'Updated comment content'}
        response = self.client.put(self.comment_detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], 'Updated comment content')
    
    def test_comment_update_non_owner(self):
        """Test comment update fails for non-owner"""
        token2 = Token.objects.create(user=self.user2)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token2.key}')
        
        data = {'content': 'Unauthorized update'}
        response = self.client.put(self.comment_detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_comment_delete_owner(self):
        """Test comment deletion by owner"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        response = self.client.delete(self.comment_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Comment.objects.filter(id=self.comment.id).exists())
    
    def test_comment_delete_non_owner(self):
        """Test comment deletion fails for non-owner"""
        token2 = Token.objects.create(user=self.user2)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token2.key}')
        
        response = self.client.delete(self.comment_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_comment_depth_limit_validation(self):
        """Test comment depth limit is enforced"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        # Create first-level reply
        reply1 = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="First reply",
            parent_comment=self.comment
        )
        
        # Create second-level reply
        reply2 = Comment.objects.create(
            user=self.user,
            roadmap_item=self.roadmap_item,
            content="Second reply",
            parent_comment=reply1
        )
        
        # Try to create third-level reply (should fail)
        data = {
            'content': 'Third level reply',
            'parent_comment': reply2.id
        }
        response = self.client.post(self.comments_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('maximum depth reached', str(response.data))


class IntegrationTestCase(APITestCase):
    """Integration tests for complete user workflows"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_complete_user_workflow(self):
        """Test complete user workflow: register -> login -> interact with roadmap"""
        # 1. Register user
        register_data = {
            'username': 'integrationuser',
            'email': 'integration@example.com',
            'password': 'testpassword123',
            'password_confirm': 'testpassword123',
        }
        register_response = self.client.post(reverse('roadmap:register'), register_data)
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        
        token = register_response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        
        # 2. Create roadmap item (admin would do this, but for test purposes)
        roadmap_item = RoadmapItem.objects.create(
            title="Integration Test Feature",
            description="Test description",
            status="planning",
            category="feature"
        )
        
        # 3. View roadmap list
        list_response = self.client.get(reverse('roadmap:roadmap_list'))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data['results']), 1)
        
        # 4. Upvote the item
        upvote_response = self.client.post(
            reverse('roadmap:toggle_upvote', kwargs={'roadmap_id': roadmap_item.pk})
        )
        self.assertEqual(upvote_response.status_code, status.HTTP_200_OK)
        self.assertTrue(upvote_response.data['upvoted'])
        
        # 5. Add a comment
        comment_data = {'content': 'This is a great feature!'}
        comment_response = self.client.post(
            reverse('roadmap:roadmap_comments', kwargs={'roadmap_id': roadmap_item.pk}),
            comment_data
        )
        self.assertEqual(comment_response.status_code, status.HTTP_201_CREATED)
        
        # 6. View roadmap detail with comments
        detail_response = self.client.get(
            reverse('roadmap:roadmap_detail', kwargs={'pk': roadmap_item.pk})
        )
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(detail_response.data['comments']), 1)
        self.assertTrue(detail_response.data['user_upvoted'])
        
        # 7. Logout
        logout_response = self.client.post(reverse('roadmap:logout'))
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
