from django.contrib import admin
from .models import User, Wallet, BankAccount, Transaction, Contact, Notification


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'username',
        'mobile_number',
        'email',
        'is_staff',
        'is_superuser',
        'date_joined',
    )
    search_fields = ('username', 'mobile_number', 'email')
    list_filter = ('is_staff', 'is_superuser', 'date_joined')


admin.site.register(Wallet)
admin.site.register(BankAccount)
admin.site.register(Transaction)
admin.site.register(Contact)
admin.site.register(Notification)