# Generated by Django 5.1.3 on 2025-02-09 00:02

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Section",
            fields=[
                ("s_id", models.AutoField(primary_key=True, serialize=False)),
                ("s_name", models.CharField(max_length=50, unique=True)),
                (
                    "s_price",
                    models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                ("s_total_tokens", models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name="Tool",
            fields=[
                ("t_id", models.AutoField(primary_key=True, serialize=False)),
                ("t_name", models.CharField(max_length=75, unique=True)),
                ("t_description", models.TextField()),
                ("t_active", models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name="UserInfo",
            fields=[
                ("i_id", models.AutoField(primary_key=True, serialize=False)),
                ("i_name", models.CharField(max_length=50)),
                ("i_description", models.CharField(max_length=200)),
                ("i_value", models.IntegerField()),
                ("i_embeddings", models.BinaryField()),
            ],
        ),
        migrations.CreateModel(
            name="Prompt",
            fields=[
                ("pr_id", models.AutoField(primary_key=True, serialize=False)),
                ("pr_role", models.CharField(max_length=50)),
                ("pr_content", models.TextField()),
                (
                    "s_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="agent_service.section",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Parameter",
            fields=[
                ("pa_id", models.AutoField(primary_key=True, serialize=False)),
                ("pa_type", models.CharField(max_length=20)),
                ("pa_name", models.CharField(max_length=75)),
                ("pa_description", models.TextField()),
                ("pa_required", models.BooleanField()),
                (
                    "t_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="agent_service.tool",
                    ),
                ),
            ],
        ),
    ]
