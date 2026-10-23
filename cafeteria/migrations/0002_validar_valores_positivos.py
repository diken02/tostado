import decimal

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("cafeteria", "0001_initial")]

    operations = [
        migrations.AlterField(
            model_name="producto",
            name="precio",
            field=models.DecimalField(
                decimal_places=2,
                max_digits=10,
                validators=[
                    django.core.validators.MinValueValidator(decimal.Decimal("0.01"))
                ],
            ),
        ),
        migrations.AlterField(
            model_name="recetaitem",
            name="cantidad",
            field=models.DecimalField(
                decimal_places=3,
                max_digits=12,
                validators=[
                    django.core.validators.MinValueValidator(decimal.Decimal("0.001"))
                ],
            ),
        ),
        migrations.AlterField(
            model_name="comprainsumo",
            name="cantidad",
            field=models.DecimalField(
                decimal_places=3,
                max_digits=12,
                validators=[
                    django.core.validators.MinValueValidator(decimal.Decimal("0.001"))
                ],
            ),
        ),
        migrations.AlterField(
            model_name="comprainsumo",
            name="costo_unitario",
            field=models.DecimalField(
                decimal_places=4,
                max_digits=12,
                validators=[
                    django.core.validators.MinValueValidator(decimal.Decimal("0.0001"))
                ],
            ),
        ),
    ]
