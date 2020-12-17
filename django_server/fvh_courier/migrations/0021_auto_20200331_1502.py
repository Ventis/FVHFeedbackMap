# Generated by Django 3.0.4 on 2020-03-31 15:02

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('fvh_courier', '0020_auto_20200327_0955'),
    ]

    operations = [
        migrations.AddField(
            model_name='address',
            name='user',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='address', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='package',
            name='depth',
            field=models.PositiveIntegerField(blank=True, help_text='in cm', null=True, verbose_name='depth'),
        ),
        migrations.AlterField(
            model_name='package',
            name='height',
            field=models.PositiveIntegerField(blank=True, help_text='in cm', null=True, verbose_name='height'),
        ),
        migrations.AlterField(
            model_name='package',
            name='weight',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='in kg', max_digits=7, null=True, verbose_name='weight'),
        ),
        migrations.AlterField(
            model_name='package',
            name='width',
            field=models.PositiveIntegerField(blank=True, help_text='in cm', null=True, verbose_name='width'),
        ),
        migrations.CreateModel(
            name='HolviPackage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('package', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='fvh_courier.Package')),
            ],
        ),
    ]
