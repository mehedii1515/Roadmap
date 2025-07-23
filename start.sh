#!/usr/bin/env bash
# Render startup script
cd backend
exec gunicorn roadmap_backend.wsgi:application
