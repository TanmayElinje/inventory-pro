# In your new migration file (e.g., inventory/migrations/0010_create_superuser.py)

import os
from django.db import migrations

def create_superuser(apps, schema_editor):
    """
    Creates a superuser and an 'Admin' group, then adds the user to the group.
    Reads credentials from environment variables.
    """
    User = apps.get_model('auth', 'User')
    Group = apps.get_model('auth', 'Group')

    # Get credentials from environment variables
    username = os.environ.get('ADMIN_USER')
    password = os.environ.get('ADMIN_PASS')
    email = os.environ.get('ADMIN_EMAIL')

    if not all([username, password, email]):
        print("Admin user credentials not found in environment variables. Skipping superuser creation.")
        return

    # Create superuser only if it doesn't exist
    if not User.objects.filter(username=username).exists():
        print(f"Creating superuser: {username}")
        User.objects.create_superuser(username=username, password=password, email=email)
    
    # Ensure the Admin group exists
    admin_group, created = Group.objects.get_or_create(name='Admin')
    
    # Add the user to the Admin group
    user = User.objects.get(username=username)
    user.groups.add(admin_group)


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0009_alter_productimage_image'), # Make sure this matches your PREVIOUS migration file name
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]