# Generated by Django 3.1.4 on 2021-02-19 15:22

from django.db import migrations, models


def forwards(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    Comment = apps.get_model('olmap', 'OSMImageNoteComment')

    def interested_users(self):
        from olmap.rest.permissions import REVIEWER_GROUP

        return User.objects.filter(
            models.Q(id__in=[self.created_by_id, self.modified_by_id, self.processed_by_id, self.reviewed_by_id]) |
            models.Q(image_note_comments__image_note=self) |
            models.Q(groups__name=REVIEWER_GROUP)
        ).distinct()

    def notify_users(self):
        """
        Create OSMImageNoteCommentNotifications for users interested in this image note to notify them of the new
        comment
        """
        for user in interested_users(self.image_note):
            if user != self.user:
                self.notifications.create(user=user)

    for comment in Comment.objects.all():
        notify_users(comment)


class Migration(migrations.Migration):

    dependencies = [
        ('olmap', '0002_osmimagenotecommentnotification'),
    ]

    operations = [
        migrations.RunPython(forwards),
    ]
