from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxLengthValidator


class RoadmapItem(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
        ('cancelled', 'Cancelled'),
    ]
    
    CATEGORY_CHOICES = [
        ('feature', 'New Feature'),
        ('improvement', 'Improvement'),
        ('bug_fix', 'Bug Fix'),
        ('maintenance', 'Maintenance'),
        ('research', 'Research'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='feature')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def upvote_count(self):
        return self.upvotes.count()


class Upvote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    roadmap_item = models.ForeignKey(RoadmapItem, on_delete=models.CASCADE, related_name='upvotes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'roadmap_item')  # Prevents duplicate upvotes
    
    def __str__(self):
        return f"{self.user.username} upvoted {self.roadmap_item.title}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    roadmap_item = models.ForeignKey(RoadmapItem, on_delete=models.CASCADE, related_name='comments')
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField(validators=[MaxLengthValidator(300)])  # 300 character limit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.roadmap_item.title}"
    
    @property
    def is_reply(self):
        return self.parent_comment is not None
    
    @property
    def depth_level(self):
        """Calculate the depth level of the comment (0 for top-level, max 2 for 3-level depth)"""
        if self.parent_comment is None:
            return 0
        elif self.parent_comment.parent_comment is None:
            return 1
        else:
            return 2
    
    def can_have_replies(self):
        """Check if this comment can have replies (max 3 levels)"""
        return self.depth_level < 2
    
    def get_replies(self):
        """Get all replies to this comment"""
        return self.replies.all()
