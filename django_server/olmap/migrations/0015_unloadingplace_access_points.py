# Generated by Django 3.1.7 on 2021-06-01 10:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('olmap', '0014_auto_20210528_1414'),
    ]

    operations = [
        migrations.AddField(
            model_name='unloadingplace',
            name='access_points',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
