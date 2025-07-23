from django.contrib import admin
from .models import RoadmapItem, Upvote, Comment


@admin.register(RoadmapItem)
class RoadmapItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'category', 'upvote_count', 'created_at']
    list_filter = ['status', 'category', 'created_at']
    search_fields = ['title', 'description']
    list_editable = ['status']
    ordering = ['-created_at']
    
    def upvote_count(self, obj):
        return obj.upvote_count
    upvote_count.short_description = 'Upvotes'


@admin.register(Upvote)
class UpvoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'roadmap_item', 'created_at']
    list_filter = ['created_at', 'roadmap_item']
    search_fields = ['user__username', 'roadmap_item__title']
    readonly_fields = ['created_at']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'roadmap_item', 'parent_comment', 'content_preview', 'depth_level', 'created_at']
    list_filter = ['created_at', 'roadmap_item']
    search_fields = ['user__username', 'content', 'roadmap_item__title']
    readonly_fields = ['created_at', 'updated_at', 'depth_level']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'
