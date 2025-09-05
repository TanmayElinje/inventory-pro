#!/usr/bin/env bash
# exit on error
set -o errexit

# --- ADD THIS LINE ---
# Load environment variables from the secret file
source .env

# These lines remain the same
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate