from django.core.management.base import BaseCommand
from roadmap.models import RoadmapItem


class Command(BaseCommand):
    help = 'Populate database with sample roadmap items'

    def handle(self, *args, **options):
        # Sample roadmap items
        sample_items = [
            {
                'title': 'User Authentication System',
                'description': 'Implement a secure user authentication system with login, registration, and password reset functionality.',
                'status': 'completed',
                'category': 'feature',
                'priority': 10
            },
            {
                'title': 'Dark Mode Support',
                'description': 'Add dark mode theme option for better user experience during night time usage.',
                'status': 'in_progress',
                'category': 'improvement',
                'priority': 8
            },
            {
                'title': 'Mobile Responsive Design',
                'description': 'Optimize the application for mobile devices and tablets with responsive design patterns.',
                'status': 'planning',
                'category': 'improvement',
                'priority': 9
            },
            {
                'title': 'Real-time Notifications',
                'description': 'Implement real-time push notifications for user activities and system updates.',
                'status': 'planning',
                'category': 'feature',
                'priority': 7
            },
            {
                'title': 'Advanced Search Functionality',
                'description': 'Add advanced search filters and sorting options for better content discovery.',
                'status': 'in_progress',
                'category': 'feature',
                'priority': 6
            },
            {
                'title': 'Performance Optimization',
                'description': 'Optimize database queries and frontend rendering for improved application performance.',
                'status': 'planning',
                'category': 'maintenance',
                'priority': 5
            },
            {
                'title': 'API Rate Limiting',
                'description': 'Implement rate limiting for API endpoints to prevent abuse and ensure fair usage.',
                'status': 'planning',
                'category': 'maintenance',
                'priority': 4
            },
            {
                'title': 'Social Media Integration',
                'description': 'Allow users to share content on social media platforms and login with social accounts.',
                'status': 'planning',
                'category': 'feature',
                'priority': 3
            },
            {
                'title': 'Bug Fix: Login Page Styling',
                'description': 'Fix styling issues on the login page that appear on certain screen resolutions.',
                'status': 'completed',
                'category': 'bug_fix',
                'priority': 2
            },
            {
                'title': 'User Analytics Dashboard',
                'description': 'Research and design analytics dashboard for tracking user engagement and behavior.',
                'status': 'planning',
                'category': 'research',
                'priority': 1
            }
        ]

        created_count = 0
        for item_data in sample_items:
            roadmap_item, created = RoadmapItem.objects.get_or_create(
                title=item_data['title'],
                defaults=item_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created roadmap item: {roadmap_item.title}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Roadmap item already exists: {roadmap_item.title}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new roadmap items.')
        ) 