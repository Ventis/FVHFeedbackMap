# Generated by Django 3.1 on 2020-08-27 10:08
from django.conf import settings
from django.db import migrations


def forwards(apps, schema_editor):
    if settings.TEST:
        return
    OSMImageNote = apps.get_model('fvh_courier', 'OSMImageNote')
    for note in OSMImageNote.objects.prefetch_related('imagenotetag_set'):
        note.tags = [t.tag for t in note.imagenotetag_set.all()]
        note.save()


class Migration(migrations.Migration):

    dependencies = [
        ('fvh_courier', '0047_auto_20201022_1342'),
    ]

    operations = [
        migrations.RunPython(forwards, lambda apps, schema_editor: None)
    ]
