from django.conf import settings
from django.db import migrations

def create_admin(apps, schema_editor):
    from django.contrib.auth.models import User
    username = settings.ADMIN_USER
    email = settings.ADMIN_EMAIL
    password = settings.ADMIN_PASS

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"Superuser '{username}' created.")
    else:
        print(f"Superuser '{username}' already exists.")

class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),  # apni first migration ka naam yahan dale
    ]

    operations = [
        migrations.RunPython(create_admin),
    ]
