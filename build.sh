#!/usr/bin/env bash
# exit on error
set -o errexit

# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Populate initial data
python manage.py populate_data

# Create superuser if needed (optional)
# python manage.py shell -c "
# from django.contrib.auth import get_user_model;
# User = get_user_model();
# User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'password123')
# "

# Populate sample data
python manage.py populate_data
