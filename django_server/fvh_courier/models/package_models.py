import datetime
import re
import uuid as uuid

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from smsframework import Gateway, OutgoingMessage
from smsframework_gatewayapi import GatewayAPIProvider
from twilio.rest import Client

from holvi_orders.signals import order_received
from .base import Address, TimestampedModel
from .courier_models import CourierCompany, Courier, Sender


if settings.SMS_PLATFORM == 'GatewayAPI':
    gateway = Gateway()
    gateway.add_provider('gapi', GatewayAPIProvider,
                         key=settings.GATEWAY_API['KEY'], secret=settings.GATEWAY_API['SECRET'])


class Package(TimestampedModel):
    name = models.CharField(max_length=64, blank=True)
    details = models.TextField(blank=True)
    pickup_at = models.ForeignKey(Address, verbose_name=_('pickup location'), related_name='outbound_packages',
                                  on_delete=models.PROTECT)
    deliver_to = models.ForeignKey(Address, verbose_name=_('destination'), related_name='inbound_packages',
                                   on_delete=models.PROTECT)

    height = models.PositiveIntegerField(verbose_name=_('height'), help_text=_('in cm'), null=True, blank=True)
    width = models.PositiveIntegerField(verbose_name=_('width'), help_text=_('in cm'), null=True, blank=True)
    depth = models.PositiveIntegerField(verbose_name=_('depth'), help_text=_('in cm'), null=True, blank=True)

    weight = models.DecimalField(verbose_name=_('weight'), help_text=_('in kg'),
                                 max_digits=7, decimal_places=2, null=True, blank=True)

    sender = models.ForeignKey(Sender, null=True, verbose_name=_('sender'), related_name='sent_packages', on_delete=models.PROTECT)

    recipient = models.CharField(max_length=128, verbose_name=_('recipient'))
    recipient_phone = models.CharField(max_length=32, verbose_name=_('recipient phone number'))
    delivery_instructions = models.CharField(max_length=256, blank=True)

    courier_company = models.ForeignKey(CourierCompany, related_name='packages', null=True, on_delete=models.SET_NULL)
    courier = models.ForeignKey(Courier, verbose_name=_('courier'), null=True, blank=True,
                                 related_name='delivered_packages', on_delete=models.PROTECT)

    earliest_pickup_time = models.DateTimeField(verbose_name=_('earliest pickup time'))
    latest_pickup_time = models.DateTimeField(verbose_name=_('latest pickup time'))

    earliest_delivery_time = models.DateTimeField(verbose_name=_('earliest delivery time'))
    latest_delivery_time = models.DateTimeField(verbose_name=_('latest delivery time'))

    picked_up_time = models.DateTimeField(verbose_name=_('picked up at'), blank=True, null=True)
    delivered_time = models.DateTimeField(verbose_name=_('delivered at'), blank=True, null=True)

    uuid = models.UUIDField(default=uuid.uuid4, editable=False)

    class Meta:
        verbose_name = _('package')
        verbose_name_plural = _('packages')
        ordering = ['-earliest_pickup_time']

    @classmethod
    def available_packages(cls):
        """
        Return all packages for which delivery has been requested but which are not yet reserved by any courier.
        """
        return cls.objects.filter(courier__isnull=True)

    def save(self, **kwargs):
        if not self.name:
            self.name = f'Package {self.id} to {self.recipient}'
        return super().save(**kwargs)

    @classmethod
    def sent_by_user(cls, user):
        return cls.objects.filter(sender__user=user)

    @classmethod
    def delivered_by_user(cls, user):
        return cls.objects.filter(courier__user=user)


class PackageSMS(TimestampedModel):
    message_types = [{
        'name': 'reservation',
        'template': 'Your package to {recipient} was reserved by {courier}. See delivery progress: {url}'
    }, {
        'name': 'pickup',
        'template': 'Your package from {sender} was picked up for delivery. See delivery progress: {url}'
    }, {
        'name': 'delivery',
        'template': 'Your package to {recipient} has been delivered.'
    }, {
        'name': 'courier_notification',
        'template': 'New package delivery request from {sender}: {url}'
    }]

    types_by_name = dict((t['name'], i) for i, t in enumerate(message_types))
    templates_by_name = dict((t['name'], t['template']) for t in message_types)

    message_type = models.PositiveSmallIntegerField(choices=((i, t['name']) for i, t in enumerate(message_types)))
    recipient_number = models.CharField(max_length=32)
    twilio_sid = models.CharField(max_length=64, blank=True)
    package = models.ForeignKey(Package, on_delete=models.CASCADE, related_name='sms_messages')
    content = models.TextField()

    class Meta:
        ordering = ['-created_at']

    @classmethod
    def render_message(cls, message_type, package, referer=None):
        return cls.templates_by_name[message_type].format(
            recipient=package.recipient,
            sender=package.sender.get_full_name(),
            courier=package.courier and package.courier.get_full_name(),
            url='{}#/package/{}'.format(referer or settings.FRONTEND_ROOT, package.uuid))

    @classmethod
    def send_message(cls, package, message_type, to_number, referer=None):
        message = cls(
            package=package,
            message_type=cls.types_by_name[message_type],
            recipient_number=to_number,
            content=cls.render_message(message_type, package, referer))

        if not settings.TEST:
            if settings.SMS_PLATFORM == 'Twilio':
                client = cls.get_twilio_client()
                if client:
                    twilio_msg = client.messages.create(
                        body=message.content,
                        to=to_number,
                        from_=settings.TWILIO['SENDER_NR'])
                    message.twilio_sid = twilio_msg.sid

            elif settings.SMS_PLATFORM == 'GatewayAPI':
                gateway.send(OutgoingMessage(to_number, message.content))

        message.save()

    @classmethod
    def message_sender(cls, package, message_type, referer):
        cls.send_message(package, message_type, package.sender.phone_number, referer)

    @classmethod
    def notify_sender_of_reservation(cls, package, referer):
        cls.message_sender(package, 'reservation', referer)

    @classmethod
    def notify_recipient_of_pickup(cls, package, referer):
        cls.send_message(package, 'pickup', package.recipient_phone, referer)

    @classmethod
    def notify_sender_of_delivery(cls, package, referer):
        cls.message_sender(package, 'delivery', referer)

    @classmethod
    def get_twilio_client(cls):
        if settings.TWILIO['ACCOUNT_SID'] != 'configure in local settings':
            return Client(settings.TWILIO['ACCOUNT_SID'], settings.TWILIO['AUTH_TOKEN'])


class HolviPackage(models.Model):
    package = models.OneToOneField(Package, on_delete=models.CASCADE)
    order = models.OneToOneField('holvi_orders.HolviOrder', on_delete=models.CASCADE)

    ignore_products = ["Shipping fee"]
    delivery_products = ['Kotiinkuljetus', 'Home delivery', 'ILMAINEN KOTIINKULJETUS']
    instruction_regex = re.compile('Delivery instructions|Ohjeet kuljettajalle', re.IGNORECASE)

    minute_limits = {
        'pickup': [20, 40],
        'delivery': [20, 60]
    }

    @classmethod
    def create_package_for_order(cls, order):
        if cls.order_needs_delivery(order):
            return cls(order=order).create_package()

    @classmethod
    def order_needs_delivery(cls, order):
        for p in order.purchases.all():
            if p.product_name in cls.delivery_products:
                return True
        return False

    def create_package(self):
        delivery_instructions = ''
        details = ''
        purchases = [p for p in self.order.purchases.all() if p.product_name not in self.ignore_products]

        for p in purchases:
            details += p.product_name
            for a in p.answers.all():
                if a.answer:
                    details += f'\n  {a.label}:\n  {a.answer}'
                    if re.search(self.instruction_regex, a.label):
                        delivery_instructions += a.answer
            details += '\n'

        meals = len(purchases) - 1  # Home delivery is one product, hence - 1
        sender_user = self.order.sender()
        sender = sender_user.sender
        self.package = Package.objects.create(
            name=f'{meals} meal{meals > 1 and "s" or ""} to {self.order.recipient_str()}'[:64],
            details=details,
            delivery_instructions=delivery_instructions,
            pickup_at=sender.address,
            deliver_to=Address.objects.get_or_create(
                street_address=self.order.street,
                city=self.order.city,
                postal_code=self.order.postcode,
                country=self.order.country
            )[0].with_latlng(),
            sender=sender,
            courier_company=sender.courier_company,
            recipient=self.order.recipient_str(),
            recipient_phone=self.order.phone,
            earliest_pickup_time=timezone.now() + datetime.timedelta(minutes=self.minute_limits['pickup'][0]),
            latest_pickup_time=timezone.now() + datetime.timedelta(minutes=self.minute_limits['pickup'][1]),

            earliest_delivery_time=timezone.now() + datetime.timedelta(minutes=self.minute_limits['delivery'][0]),
            latest_delivery_time=timezone.now() + datetime.timedelta(minutes=self.minute_limits['delivery'][1]))
        self.save()
        CourierCompany.notify_new_package(self.package)
        return self.package


def on_order_received(sender, order=None, **kwargs):
    HolviPackage.create_package_for_order(order)


order_received.connect(on_order_received)
