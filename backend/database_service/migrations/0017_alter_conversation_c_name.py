# Generated by Django 5.1.3 on 2025-04-14 07:55

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        (
            "database_service",
            "0016_remove_toolcall_m_id_category_u_id_conversation_u_id_and_more",
        ),
    ]

    operations = [
        migrations.AlterField(
            model_name="conversation",
            name="c_name",
            field=models.CharField(default="Untitled", max_length=200),
        ),
    ]
