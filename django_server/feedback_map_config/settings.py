"""
Django settings for feedback_map project.

Generated by 'django-admin startproject' using Django 3.0.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import sys

import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

CONFIG_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CONFIG_DIR)

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY", "(*z-ann&51^6l361#ymu0y9tbdk=_g*=3cy8)p%vcizdc0%_qv")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", False)

ALLOWED_HOSTS = ["127.0.0.1", "localhost", "urbanage.fvh.io"]

# Application definition

INSTALLED_APPS = [
    "feedback_map",
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "django.contrib.sites",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "rest_auth",
    "rest_auth.registration",
    "feedback_map_config.apps.AdminConfig",
    "markdown",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.gis",
]

if os.environ.get("ELASTIC_SERVICE", False):
    INSTALLED_APPS.append("elasticapm.contrib.django")

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "feedback_map_config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "feedback_map_config.wsgi.application"

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": os.environ.get("SQL_ENGINE", "django.contrib.gis.db.backends.postgis"),
        "NAME": os.environ.get("POSTGRES_DB", "feedback_map"),
        "USER": os.environ.get("POSTGRES_USER", "postgres"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "feedback_map"),
        "HOST": os.environ.get("SQL_HOST", "localhost"),
        "PORT": os.environ.get("SQL_PORT", "5432"),
    }
}

# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Europe/Helsinki"

USE_I18N = True

USE_L10N = True

USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

CORS_ORIGIN_ALLOW_ALL = True

STATIC_URL = "/staticfiles/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

MEDIA_URL = os.environ.get("MEDIA_URL", "/media/")
MEDIA_ROOT = os.environ.get("MEDIA_ROOT", os.path.join(BASE_DIR, "media"))

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
}

REST_AUTH_SERIALIZERS = {
    "USER_DETAILS_SERIALIZER": "feedback_map.rest.serializers.UserSerializer",
    "PASSWORD_RESET_SERIALIZER": "feedback_map.rest.serializers.PasswordResetSerializer",
}

LOG_DB_QUERIES = False

if LOG_DB_QUERIES:
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "filters": {
            "require_debug_true": {
                "()": "django.utils.log.RequireDebugTrue",
            }
        },
        "handlers": {
            "console": {
                "level": "DEBUG",
                "filters": ["require_debug_true"],
                "class": "logging.StreamHandler",
            }
        },
        "loggers": {
            "django.db.backends": {
                "level": "DEBUG",
                "handlers": ["console"],
            }
        },
    }

FRONTEND_ROOT = "https://urbanage.fvh.io/"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

ADMINS = [["FVH Django admins", "django-admins@forumvirium.fi"]]
EMAIL_HOST = os.environ.get("EMAIL_HOST", "localhost")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_PORT = os.environ.get("EMAIL_PORT", 25)
EMAIL_USE_SSL = os.environ.get("EMAIL_USE_SSL", False)
DEFAULT_FROM_EMAIL = os.environ.get("EMAIL_HOST_USER", "webmaster@localhost")

SENTRY_DSN = os.environ.get("SENTRY_DSN", None)
if SENTRY_DSN:
    sentry_sdk.init(dsn=SENTRY_DSN, integrations=[DjangoIntegration()], send_default_pii=True)

ELASTIC_APM = {
    "SERVICE_NAME": os.environ.get("ELASTIC_SERVICE", ""),
    "SECRET_TOKEN": os.environ.get("ELASTIC_TOKEN", ""),
    "SERVER_URL": os.environ.get("ELASTIC_URL", ""),
}

DATETIME_FORMAT = "Y-m-d H:i:s"

SITE_ID = 1

ACCOUNT_EMAIL_VERIFICATION = "none"

try:
    from .local_settings import *  # noqa
except ImportError:
    pass

if "test" in sys.argv:
    DEFAULT_FILE_STORAGE = "inmemorystorage.InMemoryStorage"
    TEST = True
    # INMEMORYSTORAGE_PERSIST = True
else:
    TEST = False
