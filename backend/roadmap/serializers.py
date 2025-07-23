from rest_framework import serializers
from django.contrib.auth.models import User
from .models import RoadmapItem, Upvote, Comment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()
    can_reply = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'parent_comment', 'created_at', 'updated_at', 
                 'can_edit', 'can_reply', 'depth_level', 'is_reply']
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        return request and request.user == obj.user
    
    def get_can_reply(self, obj):
        request = self.context.get('request')
        return request and request.user.is_authenticated and obj.can_have_replies()


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content', 'parent_comment']
    
    def validate_parent_comment(self, value):
        if value and not value.can_have_replies():
            raise serializers.ValidationError("Cannot reply to this comment (maximum depth reached)")
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['roadmap_item'] = self.context['roadmap_item']
        return super().create(validated_data)


class RoadmapItemSerializer(serializers.ModelSerializer):
    upvote_count = serializers.ReadOnlyField()
    user_upvoted = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = RoadmapItem
        fields = ['id', 'title', 'description', 'status', 'category', 'priority', 
                 'created_at', 'updated_at', 'upvote_count', 'user_upvoted', 'comments_count']
    
    def get_user_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.upvotes.filter(user=request.user).exists()
        return False
    
    def get_comments_count(self, obj):
        return obj.comments.count()


class RoadmapItemDetailSerializer(RoadmapItemSerializer):
    comments = serializers.SerializerMethodField()
    
    class Meta(RoadmapItemSerializer.Meta):
        fields = RoadmapItemSerializer.Meta.fields + ['comments']
    
    def get_comments(self, obj):
        # Only get top-level comments, replies will be nested
        top_comments = obj.comments.filter(parent_comment=None)
        return CommentSerializer(top_comments, many=True, context=self.context).data


class UpvoteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Upvote
        fields = ['id', 'user', 'roadmap_item', 'created_at']
        read_only_fields = ['user', 'created_at'] 