# Generated by Django 3.1.7 on 2021-04-09 14:00

import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('olmap', '0003_notify_comments'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkplaceType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(max_length=64)),
                ('synonyms', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=64), default=list, size=None)),
                ('osm_tags', models.JSONField()),
                ('parents', models.ManyToManyField(blank=True, related_name='children', to='olmap.WorkplaceType')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Workplace',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('street', models.CharField(blank=True, max_length=64)),
                ('housenumber', models.CharField(blank=True, help_text='E.g. 3-5', max_length=8, null=True)),
                ('unit', models.CharField(blank=True, max_length=8)),
                ('name', models.CharField(blank=True, max_length=64)),
                ('phone', models.CharField(blank=True, max_length=32)),
                ('opening_hours', models.CharField(blank=True, max_length=64)),
                ('opening_hours_covid19', models.CharField(blank=True, max_length=64)),
                ('level', models.CharField(blank=True, help_text='Floor(s), e.g. 1-3', max_length=8)),
                ('image_note', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='olmap.osmimagenote')),
                ('type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='olmap.workplacetype')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
